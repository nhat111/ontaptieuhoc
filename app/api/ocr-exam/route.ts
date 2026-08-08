import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Quét ảnh đề (ảnh chụp / scan) thành câu hỏi có cấu trúc bằng Claude vision.
//
// Dùng vision chứ không phải OCR thuần vì đề tiểu học hay được chụp nghiêng, hằn
// chữ mặt sau, và **đáp án khoanh bằng bút** — OCR chỉ trả về text thô, không
// biết câu nào được khoanh.
//
// Đây là route MỚI, không phải `/api/ai-import` đã bị xoá trước đây
// (xem "Removed routes" trong CLAUDE.md).

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

const SYSTEM = `Bạn đọc ảnh chụp đề thi trắc nghiệm của học sinh tiểu học Việt Nam và bóc thành dữ liệu có cấu trúc.

Quy tắc:
- Chép NGUYÊN VĂN nội dung câu hỏi và đáp án, giữ đúng chính tả và dấu tiếng Việt. Không diễn giải lại, không sửa lỗi, không dịch.
- Bỏ phần đánh số ở đầu câu ("1:", "Câu 2.", "Question 3.") và nhãn đáp án ("A.", "B)") khỏi nội dung.
- Đáp án đúng thường được khoanh bút, tô đậm, tick hoặc gạch chân trên ảnh. Đọc kỹ các dấu viết tay này.
- correctIndex là vị trí (bắt đầu từ 0) của đáp án đúng. Không nhìn thấy dấu đánh nào thì trả -1 — TUYỆT ĐỐI không đoán.
- Công thức toán viết dưới dạng LaTeX trong cặp $...$.
- Ảnh xoay ngang hay ngược thì tự xoay lại trong đầu rồi đọc.
- Chỉ bóc những gì thực sự nhìn thấy. Chữ bị mờ, bị che, không đọc được thì bỏ qua câu đó.`;

const SCHEMA = {
  type: "object",
  properties: {
    title: {
      type: "string",
      description: "Tiêu đề đề thi in trên ảnh; không có thì để chuỗi rỗng.",
    },
    questions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          content: { type: "string", description: "Nội dung câu hỏi, đã bỏ phần đánh số." },
          options: {
            type: "array",
            items: { type: "string" },
            description: "Các đáp án theo đúng thứ tự, đã bỏ nhãn A./B./C./D.",
          },
          correctIndex: {
            type: "integer",
            enum: [-1, 0, 1, 2, 3, 4, 5],
            description: "Vị trí đáp án được khoanh/đánh dấu; -1 nếu không thấy dấu nào.",
          },
        },
        required: ["content", "options", "correctIndex"],
        additionalProperties: false,
      },
    },
  },
  required: ["title", "questions"],
  additionalProperties: false,
} as const;

type OcrQuestion = { content: string; options: string[]; correctIndex: number };

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Chưa cấu hình ANTHROPIC_API_KEY trên máy chủ." },
      { status: 503 }
    );
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Yêu cầu không hợp lệ." }, { status: 400 });
  }

  const file = form.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: "Không tìm thấy ảnh trong yêu cầu." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Ảnh quá lớn (tối đa 10MB)." }, { status: 413 });
  }
  if (!ALLOWED_TYPES.includes(file.type as AllowedType)) {
    return NextResponse.json(
      { error: "Chỉ nhận ảnh JPG, PNG, WEBP hoặc GIF." },
      { status: 415 }
    );
  }

  const base64 = Buffer.from(await file.arrayBuffer()).toString("base64");
  const client = new Anthropic({ apiKey });

  // Phần chung của request; chỉ `fallbacks` là tuỳ chọn (xem dưới).
  const baseParams = {
    model: "claude-opus-5",
    max_tokens: 16000,
    system: SYSTEM,
    // Ràng buộc JSON theo schema nên không cần tự parse text rồi đoán.
    output_config: { format: { type: "json_schema" as const, schema: SCHEMA } },
    messages: [
      {
        role: "user" as const,
        content: [
          {
            type: "image" as const,
            source: {
              type: "base64" as const,
              media_type: file.type as AllowedType,
              data: base64,
            },
          },
          {
            type: "text" as const,
            text: "Bóc toàn bộ câu hỏi trong ảnh đề này. Nhớ đọc các dấu khoanh bút để xác định đáp án đúng.",
          },
        ],
      },
    ],
  };

  try {
    let message;
    try {
      // Bộ lọc an toàn có thể từ chối; `fallbacks: "default"` cho chạy lại trên
      // model dự phòng ngay trong cùng lượt gọi.
      message = await client.beta.messages.create({
        ...baseParams,
        betas: ["server-side-fallback-2026-07-01"],
        fallbacks: "default",
      });
    } catch (err) {
      // Cờ beta là tuỳ chọn và có thể chưa bật cho tài khoản này. Bị từ chối vì
      // riêng `fallbacks` thì chạy lại không kèm nó, thay vì hỏng cả tính năng.
      if (err instanceof Anthropic.BadRequestError && /fallback/i.test(err.message)) {
        console.warn("[/api/ocr-exam] fallbacks bị từ chối, chạy lại không kèm:", err.message);
        message = await client.beta.messages.create(baseParams);
      } else {
        throw err;
      }
    }

    // Phải kiểm tra stop_reason TRƯỚC khi đọc content — khi bị từ chối thì
    // content rỗng hoặc chỉ có một phần.
    if (message.stop_reason === "refusal") {
      console.error("[/api/ocr-exam] refusal", message.stop_details);
      return NextResponse.json(
        { error: "Không xử lý được ảnh này. Thử ảnh khác hoặc nhập tay giúp mình." },
        { status: 422 }
      );
    }

    const text = message.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    let parsed: { title?: string; questions?: OcrQuestion[] };
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("[/api/ocr-exam] JSON không hợp lệ:", text.slice(0, 500));
      return NextResponse.json({ error: "Máy chủ trả về dữ liệu không hợp lệ." }, { status: 502 });
    }

    // Bỏ câu rỗng; đáp án dưới 2 lựa chọn thì coi như câu tự luận (options rỗng)
    // để phía client suy ra đúng loại câu hỏi.
    const questions = (parsed.questions ?? [])
      .filter((q) => q && typeof q.content === "string" && q.content.trim())
      .map((q) => {
        const options = (Array.isArray(q.options) ? q.options : [])
          .filter((o): o is string => typeof o === "string" && o.trim().length > 0)
          .map((o) => o.trim());
        const idx = Number.isInteger(q.correctIndex) ? q.correctIndex : -1;
        return {
          content: q.content.trim(),
          options: options.length >= 2 ? options : [],
          // Chỉ số vượt ngoài danh sách đáp án thì coi như chưa xác định.
          correctIndex: options.length >= 2 && idx >= 0 && idx < options.length ? idx : -1,
        };
      });

    if (!questions.length) {
      return NextResponse.json(
        { error: "Không đọc được câu hỏi nào trong ảnh. Thử chụp rõ và thẳng hơn." },
        { status: 422 }
      );
    }

    return NextResponse.json({
      title: typeof parsed.title === "string" ? parsed.title.trim() : "",
      questions,
      usage: {
        inputTokens: message.usage.input_tokens,
        outputTokens: message.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[/api/ocr-exam]", msg);
    if (err instanceof Anthropic.RateLimitError) {
      return NextResponse.json({ error: "Đang quá tải, thử lại sau ít phút." }, { status: 429 });
    }
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: "ANTHROPIC_API_KEY không hợp lệ." }, { status: 500 });
    }
    return NextResponse.json({ error: "Không quét được ảnh đề." }, { status: 500 });
  }
}
