// lib/exam5/enContent5.ts
// Nội dung đề Tiếng Anh lớp 5 theo Tiếng Anh 5 Global Success (Kết nối tri thức) — VIẾT TAY,
// không chép sách: hội thoại, nhóm từ, câu ngữ pháp dựng theo chủ đề và mẫu câu của từng Unit;
// bài đọc tự soạn. Tên Unit theo mục lục (đối chiếu loigiaihay.com, 10/2026).
// CẦN NGƯỜI DUYỆT: máy chỉ soát được hình thức (scripts/tieng-anh-check.ts).
//
// Quy tắc:
//   • `qa.a` chứa nguyên văn `key`; `wrong` cùng loại với `key`, và thay vào vẫn ra câu đúng
//     ngữ pháp (để câu nghe chỉ phân biệt bằng nghe).
//   • `gram`: đúng MỘT lựa chọn hợp với chỗ trống "___".
//   • `groups`: hai nhóm (kể cả ở Unit khác) không chung từ; từ của nhóm này không được thuộc
//     nghĩa của nhóm kia.
//   • Dùng dấu nháy thẳng ' trong tiếng Anh (I'm, it's), ngoặc kép cong trong lời giải tiếng Việt.

import type { EnContent, EnUnit, EnPassage } from "./tiengAnh";

const U = (u: EnUnit) => u;
const P = (p: EnPassage) => p;

const UNITS: EnUnit[] = [
  /* ═════════════ TẬP MỘT ═════════════ */
  U({
    n: 1, title: "All about me!",
    qa: [
      { q: "Can you tell me about yourself?", a: "I'm Mai. I'm in class 5B.", key: "5B", wrong: ["4B", "5C"] },
      { q: "Where do you live?", a: "I live in Hoan Kiem ward.", key: "Hoan Kiem", wrong: ["Ba Dinh", "Tay Ho"] },
      { q: "What's your favourite colour?", a: "It's green.", key: "green", wrong: ["yellow", "purple"] },
      { q: "What's your favourite food?", a: "I like noodles.", key: "noodles", wrong: ["chicken", "fish"] },
    ],
    groups: { "màu sắc": ["green", "yellow", "purple", "orange", "pink"] },
    gram: [
      { q: "What's your favourite subject? – ___ maths.", options: ["It's", "They're", "I'm"], answer: "It's", explain: "Hỏi một môn học yêu thích → trả lời “It's + môn học”." },
      { q: "I ___ in class 5A.", options: ["am", "is", "are"], answer: "am", explain: "Chủ ngữ “I” đi với “am”." },
      { q: "Can you tell me about ___?", options: ["yourself", "your", "you're"], answer: "yourself", explain: "Mẫu câu: Can you tell me about yourself?" },
    ],
  }),
  U({
    n: 2, title: "Our homes",
    qa: [
      { q: "What's your address?", a: "It's 25 Tran Phu street.", key: "25", wrong: ["35", "52"] },
      { q: "Do you live in this building?", a: "No, I don't. I live in that tower.", key: "tower", wrong: ["house", "flat"] },
      { q: "What's his address?", a: "It's 18 Hoa Binh road.", key: "18", wrong: ["80", "8"] },
      { q: "Does she live in a house?", a: "Yes, she does. She lives in a big house.", key: "big", wrong: ["small", "new"] },
    ],
    groups: { "nơi ở": ["house", "flat", "tower", "building", "apartment"] },
    gram: [
      { q: "___ you live in this building? – Yes, I do.", options: ["Do", "Does", "Are"], answer: "Do", explain: "Câu hỏi với “you” dùng trợ động từ “Do”." },
      { q: "Does he live in a flat? – No, he ___.", options: ["doesn't", "don't", "isn't"], answer: "doesn't", explain: "Câu hỏi bắt đầu bằng “Does” → trả lời “No, he doesn't.”" },
      { q: "What's ___ address? – It's 10 Le Loi street.", options: ["your", "you", "you're"], answer: "your", explain: "Trước danh từ “address” dùng tính từ sở hữu “your”." },
    ],
  }),
  U({
    n: 3, title: "My foreign friends",
    qa: [
      { q: "What nationality is he?", a: "He's Japanese.", key: "Japanese", wrong: ["Korean", "Thai"] },
      { q: "What nationality is she?", a: "She's Australian.", key: "Australian", wrong: ["American", "British"] },
      { q: "What's he like?", a: "He's friendly.", key: "friendly", wrong: ["clever", "active"] },
      { q: "What's she like?", a: "She's helpful.", key: "helpful", wrong: ["kind", "funny"] },
    ],
    groups: {
      "quốc tịch": ["Japanese", "Korean", "Thai", "Australian", "American", "British", "Malaysian"],
      "từ chỉ tính cách": ["friendly", "clever", "active", "helpful", "kind", "funny"],
    },
    gram: [
      { q: "She's from Korea. She's ___.", options: ["Korean", "Korea", "Koreans"], answer: "Korean", explain: "Korea là tên nước; quốc tịch là “Korean”: She's Korean." },
      { q: "What's he ___? – He's clever.", options: ["like", "likes", "liking"], answer: "like", explain: "Hỏi tính cách: What's he like?" },
      { q: "Tom is from America. He's ___.", options: ["American", "America", "English"], answer: "American", explain: "Người đến từ America có quốc tịch “American”." },
    ],
  }),
  U({
    n: 4, title: "Our free-time activities",
    qa: [
      { q: "What do you like doing in your free time?", a: "I like playing chess.", key: "playing chess", wrong: ["watching TV", "reading comics"] },
      { q: "What does she like doing in her free time?", a: "She likes going for a walk.", key: "going for a walk", wrong: ["going shopping", "going swimming"] },
      { q: "What do you do at the weekend?", a: "I often water the flowers.", key: "water the flowers", wrong: ["clean the house", "cook dinner"] },
      { q: "What does he do at the weekend?", a: "He sometimes visits his grandparents.", key: "visits his grandparents", wrong: ["plays the piano", "rides his bike"] },
    ],
    groups: { "từ chỉ mức độ thường xuyên": ["always", "usually", "often", "sometimes", "never"] },
    gram: [
      { q: "I like ___ comics in my free time.", options: ["reading", "read", "reads"], answer: "reading", explain: "Sau “like” dùng động từ thêm -ing: like reading." },
      { q: "She often ___ the piano at the weekend.", options: ["plays", "play", "playing"], answer: "plays", explain: "Chủ ngữ “She” → động từ thêm -s: plays." },
      { q: "What ___ you do at the weekend?", options: ["do", "does", "are"], answer: "do", explain: "Câu hỏi với “you” dùng trợ động từ “do”." },
    ],
  }),
  U({
    n: 5, title: "My future job",
    qa: [
      { q: "What would you like to be in the future?", a: "I'd like to be a pilot.", key: "pilot", wrong: ["doctor", "farmer"] },
      { q: "Why would you like to be a firefighter?", a: "Because I'd like to help people.", key: "help people", wrong: ["grow flowers", "write stories"] },
      { q: "What would she like to be in the future?", a: "She'd like to be a reporter.", key: "reporter", wrong: ["teacher", "singer"] },
      { q: "Why would he like to be a gardener?", a: "Because he'd like to grow flowers.", key: "grow flowers", wrong: ["fly a plane", "teach children"] },
    ],
    groups: { "từ chỉ nghề nghiệp": ["pilot", "doctor", "farmer", "firefighter", "reporter", "teacher", "gardener", "writer"] },
    gram: [
      { q: "I'd like to be ___ engineer.", options: ["an", "a", "the"], answer: "an", explain: "“engineer” bắt đầu bằng nguyên âm → dùng “an”." },
      { q: "What would you like ___ in the future?", options: ["to be", "be", "being"], answer: "to be", explain: "Mẫu câu: What would you like to be in the future?" },
      { q: "Why would you like to be a writer? – ___ I'd like to write stories.", options: ["Because", "So", "And"], answer: "Because", explain: "Trả lời câu hỏi “Why” bằng “Because …”." },
    ],
  }),
  U({
    n: 6, title: "Our school rooms",
    qa: [
      { q: "Where's the computer room?", a: "It's on the second floor.", key: "second", wrong: ["first", "third"] },
      { q: "Where's the library?", a: "It's on the ground floor.", key: "ground", wrong: ["first", "second"] },
      { q: "Could you tell me the way to the art room, please?", a: "Go upstairs and turn left.", key: "left", wrong: ["right", "back"] },
      { q: "Could you tell me the way to the gym, please?", a: "Go downstairs and go past the music room.", key: "music room", wrong: ["art room", "computer room"] },
    ],
    groups: { "phòng trong trường": ["library", "gym", "art room", "music room", "computer room", "classroom"] },
    gram: [
      { q: "Where's the music room? – It's ___ the first floor.", options: ["on", "in", "at"], answer: "on", explain: "Ở tầng nào dùng “on”: on the first floor." },
      { q: "Go ___ the library and turn right.", options: ["past", "pass", "passing"], answer: "past", explain: "Đi ngang qua: go past + nơi chốn." },
      { q: "___ the computer room? – It's on the third floor.", options: ["Where's", "What's", "Who's"], answer: "Where's", explain: "Hỏi vị trí dùng “Where's …?”." },
    ],
  }),
  U({
    n: 7, title: "Our favourite school activities",
    qa: [
      { q: "What school activity does she like?", a: "She likes reading books.", key: "reading books", wrong: ["singing songs", "playing games"] },
      { q: "What school activity do you like?", a: "I like solving maths problems.", key: "solving maths problems", wrong: ["drawing pictures", "doing projects"] },
      { q: "Why does he like playing games?", a: "Because he thinks it's fun.", key: "fun", wrong: ["easy", "useful"] },
      { q: "Why do you like doing projects?", a: "Because I think it's interesting.", key: "interesting", wrong: ["exciting", "difficult"] },
    ],
    groups: { "hoạt động ở trường": ["reading books", "singing songs", "drawing pictures", "playing games", "doing projects"] },
    gram: [
      { q: "What school activity ___ he like?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
      { q: "She likes ___ songs in the music club.", options: ["singing", "sing", "sings"], answer: "singing", explain: "Sau “likes” dùng động từ thêm -ing." },
      { q: "Why do you like reading books? – Because I think ___ interesting.", options: ["it's", "they're", "I'm"], answer: "it's", explain: "Nói về một hoạt động → “it's + tính từ”." },
    ],
  }),
  U({
    n: 8, title: "In our classroom",
    qa: [
      { q: "Where are the crayons?", a: "They're on the table.", key: "on", wrong: ["under", "in"] },
      { q: "Where's the glue stick?", a: "It's in the pencil case.", key: "pencil case", wrong: ["school bag", "box"] },
      { q: "Whose ruler is this?", a: "It's Nam's.", key: "Nam's", wrong: ["Mai's", "Linh's"] },
      { q: "Whose scissors are these?", a: "They're Lucy's.", key: "Lucy's", wrong: ["Tom's", "Ben's"] },
    ],
    groups: { "đồ dùng học tập": ["crayons", "glue stick", "ruler", "scissors", "markers", "notebook", "pencil sharpener"] },
    gram: [
      { q: "Where ___ the markers? – They're in the box.", options: ["are", "is", "am"], answer: "are", explain: "“markers” là số nhiều → “are”." },
      { q: "___ notebook is this? – It's Mai's.", options: ["Whose", "Who", "Where"], answer: "Whose", explain: "Hỏi đồ vật của ai dùng “Whose + danh từ”." },
      { q: "Where's the ruler? – ___ under the chair.", options: ["It's", "They're", "Its"], answer: "It's", explain: "“ruler” là số ít → “It's”." },
    ],
  }),
  U({
    n: 9, title: "Our outdoor activities",
    qa: [
      { q: "Where were you last weekend?", a: "I was at the campsite.", key: "campsite", wrong: ["stadium", "beach"] },
      { q: "Where was she yesterday?", a: "She was at the park.", key: "park", wrong: ["zoo", "library"] },
      { q: "What did you do there?", a: "I flew a kite.", key: "flew a kite", wrong: ["rode a bike", "played football"] },
      { q: "Did you play football last Sunday?", a: "No, I didn't. I played badminton.", key: "badminton", wrong: ["volleyball", "basketball"] },
    ],
    groups: { "môn thể thao": ["football", "badminton", "volleyball", "basketball", "table tennis"] },
    gram: [
      { q: "They ___ at the stadium yesterday.", options: ["were", "was", "are"], answer: "were", explain: "“yesterday” → quá khứ; “They” đi với “were”." },
      { q: "___ you at the zoo last week? – Yes, I was.", options: ["Were", "Was", "Did"], answer: "Were", explain: "Câu hỏi với “you” ở quá khứ dùng “Were”." },
      { q: "I ___ to music yesterday.", options: ["listened", "listen", "listening"], answer: "listened", explain: "“yesterday” → động từ quá khứ: listened." },
    ],
  }),
  U({
    n: 10, title: "Our school trip",
    qa: [
      { q: "Where did you go on your school trip?", a: "We went to the museum.", key: "museum", wrong: ["farm", "zoo"] },
      { q: "What did you do at the farm?", a: "We fed the animals.", key: "fed the animals", wrong: ["planted trees", "took photos"] },
      { q: "Did you visit Ha Long Bay?", a: "Yes, we did. We took a boat trip.", key: "boat trip", wrong: ["bus trip", "train trip"] },
      { q: "What did they do at the park?", a: "They played games.", key: "played games", wrong: ["sang songs", "had lunch"] },
    ],
    groups: { "động từ ở thì quá khứ": ["went", "visited", "played", "took", "saw", "fed", "planted"] },
    gram: [
      { q: "___ you go to the zoo last month? – Yes, we did.", options: ["Did", "Do", "Were"], answer: "Did", explain: "Câu hỏi với động từ thường ở quá khứ dùng “Did”." },
      { q: "We ___ a lot of photos on the trip.", options: ["took", "take", "taked"], answer: "took", explain: "Quá khứ của “take” là “took”." },
      { q: "What did you ___ at the museum?", options: ["see", "saw", "seeing"], answer: "see", explain: "Sau “did” dùng động từ nguyên mẫu: What did you see?" },
    ],
  }),

  /* ═════════════ TẬP HAI ═════════════ */
  U({
    n: 11, title: "Family time",
    qa: [
      { q: "Did you take a boat trip around the bay?", a: "Yes, I did. It was fun.", key: "fun", wrong: ["boring", "scary"] },
      { q: "What did your family do in Da Nang?", a: "We went to the beach.", key: "beach", wrong: ["market", "mountain"] },
      { q: "What did your family do in Bangkok?", a: "We bought souvenirs.", key: "souvenirs", wrong: ["clothes", "books"] },
      { q: "Where did you go last summer?", a: "I went to Nha Trang with my family.", key: "Nha Trang", wrong: ["Hue", "Sa Pa"] },
    ],
    groups: { "người trong gia đình": ["father", "mother", "brother", "sister", "grandfather", "grandmother"] },
    gram: [
      { q: "My family ___ to Hue last summer.", options: ["went", "go", "goes"], answer: "went", explain: "“last summer” → quá khứ: went." },
      { q: "Did they buy souvenirs? – No, they ___.", options: ["didn't", "don't", "weren't"], answer: "didn't", explain: "Câu hỏi bằng “Did” → trả lời “No, they didn't.”" },
      { q: "We ___ delicious food in Bangkok.", options: ["had", "have", "has"], answer: "had", explain: "Quá khứ của “have” là “had”." },
    ],
  }),
  U({
    n: 12, title: "Our Tet holiday",
    qa: [
      { q: "Will you make banh chung at Tet?", a: "Yes, I will. I'll make it with my grandma.", key: "grandma", wrong: ["mother", "sister"] },
      { q: "Where will you go at Tet?", a: "I'll go to the pagoda.", key: "pagoda", wrong: ["flower market", "beach"] },
      { q: "What will you do at Tet?", a: "I'll visit my grandparents.", key: "visit my grandparents", wrong: ["watch fireworks", "decorate the house"] },
      { q: "What will you get at Tet?", a: "I'll get lucky money.", key: "lucky money", wrong: ["new clothes", "toys"] },
    ],
    groups: { "hoạt động ngày Tết": ["make banh chung", "watch fireworks", "get lucky money", "decorate the house", "visit relatives"] },
    gram: [
      { q: "I ___ watch fireworks on New Year's Eve.", options: ["will", "am", "did"], answer: "will", explain: "Nói việc sẽ làm → “will + động từ nguyên mẫu”." },
      { q: "Will you go to the flower market? – No, I ___.", options: ["won't", "willn't", "don't"], answer: "won't", explain: "Phủ định của “will” là “won't”." },
      { q: "Where will you ___ at Tet?", options: ["go", "goes", "going"], answer: "go", explain: "Sau “will” dùng động từ nguyên mẫu." },
    ],
  }),
  U({
    n: 13, title: "Our special days",
    qa: [
      { q: "What will you do at the Mid-Autumn Festival?", a: "We'll join in the lantern parade.", key: "lantern parade", wrong: ["school parade", "dragon dance"] },
      { q: "What food will you have at the party?", a: "I'll have some fries.", key: "fries", wrong: ["sandwiches", "cakes"] },
      { q: "What drink will she have at the party?", a: "She'll have some apple juice.", key: "apple juice", wrong: ["lemonade", "milk"] },
      { q: "What will you do on Teachers' Day?", a: "I'll give flowers to my teacher.", key: "flowers", wrong: ["cards", "cakes"] },
    ],
    groups: { "đồ uống": ["apple juice", "lemonade", "milk", "orange juice", "water"] },
    gram: [
      { q: "We give flowers to our teachers ___ Teachers' Day.", options: ["on", "at", "in"], answer: "on", explain: "Ngày có chữ “Day” trong tên dùng “on”." },
      { q: "Children eat mooncakes ___ the Mid-Autumn Festival.", options: ["at", "on", "to"], answer: "at", explain: "Dịp lễ không có chữ “Day” trong tên dùng “at”." },
      { q: "What drink ___ you have at the party?", options: ["will", "do", "are"], answer: "will", explain: "Hỏi việc sẽ làm: What drink will you have?" },
    ],
  }),
  U({
    n: 14, title: "Staying healthy",
    qa: [
      { q: "How does she stay healthy?", a: "She does yoga.", key: "yoga", wrong: ["karate", "exercise"] },
      { q: "How do you stay healthy?", a: "I eat a lot of fruit.", key: "fruit", wrong: ["vegetables", "fish"] },
      { q: "How often does he drink fresh juice?", a: "He drinks it every day.", key: "every day", wrong: ["once a week", "twice a week"] },
      { q: "How often do you do morning exercise?", a: "I do it three times a week.", key: "three times", wrong: ["two times", "four times"] },
    ],
    groups: { "cách nói số lần": ["once", "twice", "three times", "four times"] },
    gram: [
      { q: "How does he stay healthy? – He ___ sports regularly.", options: ["plays", "play", "playing"], answer: "plays", explain: "Chủ ngữ “He” → động từ thêm -s." },
      { q: "How ___ do you go swimming? – Twice a week.", options: ["often", "much", "many"], answer: "often", explain: "Hỏi số lần làm việc gì: How often …?" },
      { q: "How ___ she stay healthy?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “she” → trợ động từ “does”." },
    ],
  }),
  U({
    n: 15, title: "Our health",
    qa: [
      { q: "What's the matter?", a: "I have a headache.", key: "headache", wrong: ["toothache", "stomach ache"] },
      { q: "What's the matter with him?", a: "He has a sore throat.", key: "sore throat", wrong: ["fever", "cold"] },
      { q: "What should I do?", a: "You should go to the dentist.", key: "dentist", wrong: ["doctor", "nurse"] },
      { q: "I have a fever. What should I do?", a: "You should take a rest.", key: "take a rest", wrong: ["go to bed late", "eat ice cream"] },
    ],
    groups: { "bệnh, chứng đau": ["headache", "toothache", "stomach ache", "sore throat", "fever", "cold"] },
    gram: [
      { q: "You ___ drink warm water.", options: ["should", "shoulds", "are"], answer: "should", explain: "Khuyên ai đó: should + động từ nguyên mẫu (không thêm -s)." },
      { q: "What's the ___? – I have a toothache.", options: ["matter", "wrong", "bad"], answer: "matter", explain: "Hỏi bị làm sao: What's the matter?" },
      { q: "She has a stomach ache. She should ___ to the doctor.", options: ["go", "goes", "going"], answer: "go", explain: "Sau “should” dùng động từ nguyên mẫu." },
    ],
  }),
  U({
    n: 16, title: "Seasons and the weather",
    qa: [
      { q: "How's the weather in Ha Noi in summer?", a: "It's hot and sunny.", key: "hot", wrong: ["cold", "cool"] },
      { q: "How's the weather in Da Lat in winter?", a: "It's cold and windy.", key: "cold", wrong: ["hot", "warm"] },
      { q: "What do you usually wear in winter?", a: "I wear a coat and a scarf.", key: "scarf", wrong: ["T-shirt", "cap"] },
      { q: "What do you usually wear in summer?", a: "I wear a T-shirt and shorts.", key: "shorts", wrong: ["jeans", "boots"] },
    ],
    groups: {
      "mùa trong năm": ["spring", "summer", "autumn", "winter"],
      "từ chỉ thời tiết": ["sunny", "rainy", "windy", "cloudy", "snowy"],
      "quần áo": ["coat", "scarf", "T-shirt", "shorts", "jeans", "jumper"],
    },
    gram: [
      { q: "What do you usually wear ___ winter?", options: ["in", "on", "at"], answer: "in", explain: "Trước mùa dùng “in”: in winter." },
      { q: "___ the weather in Hue in autumn? – It's cool.", options: ["How's", "What's", "Where's"], answer: "How's", explain: "Hỏi thời tiết: How's the weather …?" },
      { q: "It ___ often rainy in Ho Chi Minh City in July.", options: ["is", "are", "be"], answer: "is", explain: "Chủ ngữ “It” đi với “is”." },
    ],
  }),
  U({
    n: 17, title: "Stories for children",
    qa: [
      { q: "Who are the main characters in the story?", a: "They're the hare and the tortoise.", key: "tortoise", wrong: ["fox", "crow"] },
      { q: "Who is the main character in the story?", a: "She's Cinderella.", key: "Cinderella", wrong: ["Snow White", "Little Red Riding Hood"] },
      { q: "How did the hare run?", a: "He ran fast.", key: "fast", wrong: ["slowly", "quietly"] },
      { q: "How did the tortoise walk?", a: "He walked slowly.", key: "slowly", wrong: ["quickly", "happily"] },
    ],
    groups: { "con vật trong truyện": ["hare", "tortoise", "fox", "crow", "lion", "mouse"] },
    gram: [
      { q: "The fox ___ quietly into the garden.", options: ["walked", "walks", "walking"], answer: "walked", explain: "Kể chuyện đã xảy ra → động từ quá khứ: walked." },
      { q: "How ___ the mouse run? – It ran quickly.", options: ["did", "does", "was"], answer: "did", explain: "Câu trả lời ở quá khứ (ran) → câu hỏi dùng “did”." },
      { q: "Who ___ the main characters in the story?", options: ["are", "is", "am"], answer: "are", explain: "“characters” là số nhiều → “are”." },
    ],
  }),
  U({
    n: 18, title: "Means of transport",
    qa: [
      { q: "Where do you want to visit?", a: "I want to visit the City Museum.", key: "Museum", wrong: ["Zoo", "Park"] },
      { q: "How can I get to Ngo Mon Square?", a: "You can get there by bus.", key: "bus", wrong: ["taxi", "train"] },
      { q: "Where does she want to visit?", a: "She wants to visit the Opera House.", key: "Opera House", wrong: ["Water Park", "Post Office"] },
      { q: "How can we get to Phu Quoc?", a: "We can get there by plane.", key: "plane", wrong: ["boat", "coach"] },
    ],
    groups: { "phương tiện giao thông": ["bus", "taxi", "train", "plane", "boat", "motorbike", "bike"] },
    gram: [
      { q: "You can get there ___ train.", options: ["by", "on", "in"], answer: "by", explain: "Đi bằng phương tiện gì: by + phương tiện." },
      { q: "Where ___ he want to visit?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
      { q: "She ___ to visit Hoi An.", options: ["wants", "want", "wanting"], answer: "wants", explain: "Chủ ngữ “She” → động từ thêm -s: wants." },
    ],
  }),
  U({
    n: 19, title: "Places of interest",
    qa: [
      { q: "What do you think of Da Lat?", a: "I think it's cool and beautiful.", key: "cool", wrong: ["hot", "busy"] },
      { q: "What does he think of Hoi An?", a: "He thinks it's old and quiet.", key: "old", wrong: ["new", "modern"] },
      { q: "How far is it from Ha Noi to Hai Phong?", a: "It's about 100 kilometres.", key: "100", wrong: ["10", "1000"] },
      { q: "What do they think of Sa Pa?", a: "They think it's wonderful.", key: "wonderful", wrong: ["crowded", "noisy"] },
    ],
    groups: { "địa danh ở Việt Nam": ["Da Lat", "Hoi An", "Sa Pa", "Ha Long Bay", "Phu Quoc", "Hue"] },
    gram: [
      { q: "What does she think ___ Ha Long Bay?", options: ["of", "in", "at"], answer: "of", explain: "Hỏi ý kiến: What do/does … think of …?" },
      { q: "How ___ is it from Hue to Da Nang? – About 100 kilometres.", options: ["far", "many", "old"], answer: "far", explain: "Hỏi khoảng cách: How far is it from … to …?" },
      { q: "He ___ it's very beautiful.", options: ["thinks", "think", "thinking"], answer: "thinks", explain: "Chủ ngữ “He” → động từ thêm -s: thinks." },
    ],
  }),
  U({
    n: 20, title: "Our summer holiday",
    qa: [
      { q: "Where are you going to visit this summer?", a: "I'm going to visit Da Nang.", key: "Da Nang", wrong: ["Ha Long Bay", "Can Tho"] },
      { q: "What are you going to do there?", a: "I'm going to build sandcastles.", key: "sandcastles", wrong: ["kites", "snowmen"] },
      { q: "What is she going to do this summer?", a: "She's going to join a music club.", key: "music club", wrong: ["art club", "football club"] },
      { q: "Where are they going to stay?", a: "They're going to stay in a hotel.", key: "hotel", wrong: ["tent", "flat"] },
    ],
    groups: { "câu lạc bộ, khoá học hè": ["music club", "art club", "football club", "swimming class", "cooking class"] },
    gram: [
      { q: "I'm going ___ visit my grandparents this summer.", options: ["to", "for", "at"], answer: "to", explain: "Dự định: be going to + động từ nguyên mẫu." },
      { q: "What ___ he going to do this summer?", options: ["is", "are", "does"], answer: "is", explain: "Chủ ngữ “he” → “is going to”." },
      { q: "They're going to ___ swimming in the sea.", options: ["go", "goes", "going"], answer: "go", explain: "Sau “going to” dùng động từ nguyên mẫu." },
    ],
  }),
];

const PASSAGES: EnPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I (Unit 1–5) ═════════════ */
  P({
    id: "my-friend-ken", kinds: ["giua-hk1"], title: "My friend Ken",
    text: `Hi, I'm Minh. I'm in class 5A at Hoa Sen Primary School. I live in a flat in Ha Noi. This is my foreign friend, Ken. He's Japanese. He lives in a big house near my school.

Ken is friendly and clever. In his free time, he likes playing chess and reading comics. At the weekend, he often helps his mother in the garden. In the future, Ken would like to be a doctor because he'd like to help sick people.`,
    tf: [
      { s: "Minh lives in a flat in Ha Noi.", answer: "True", explain: "“I live in a flat in Ha Noi.”" },
      { s: "Ken is Korean.", answer: "False", explain: "“He's Japanese.”" },
      { s: "Ken likes playing chess in his free time.", answer: "True", explain: "“In his free time, he likes playing chess and reading comics.”" },
      { s: "Ken would like to be a teacher in the future.", answer: "False", explain: "“Ken would like to be a doctor.”" },
    ],
  }),
  P({
    id: "lucy-weekend", kinds: ["giua-hk1"], title: "Lucy's weekend",
    text: `My name is Lucy. I'm from Australia, but now I live in Ho Chi Minh City. My address is 15 Le Loi street. I'm in Grade 5.

I'm very active. At the weekend, I usually go swimming with my father. Sometimes I go shopping with my mother. My favourite food is pizza and my favourite colour is purple. I'd like to be a reporter in the future because I'd like to travel and meet new people.`,
    tf: [
      { s: "Lucy is from Australia.", answer: "True", explain: "“I'm from Australia.”" },
      { s: "Her address is 50 Le Loi street.", answer: "False", explain: "“My address is 15 Le Loi street.”" },
      { s: "She usually goes swimming with her father at the weekend.", answer: "True", explain: "“At the weekend, I usually go swimming with my father.”" },
      { s: "Lucy would like to be a pilot.", answer: "False", explain: "“I'd like to be a reporter in the future.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ I (Unit 1–10) ═════════════ */
  P({
    id: "our-school-trip", kinds: ["cuoi-hk1"], title: "Our school trip",
    text: `Last Friday, my class went on a school trip to a farm. We went there by bus. It was sunny and warm.

At the farm, we fed the chickens and the ducks. Then we planted some trees in the garden. After lunch, we played games and sang songs. My friend Nam took a lot of photos. We came back to school at four o'clock. We were tired, but we were very happy.`,
    tf: [
      { s: "The class went to a farm last Friday.", answer: "True", explain: "“Last Friday, my class went on a school trip to a farm.”" },
      { s: "It was rainy on the day of the trip.", answer: "False", explain: "“It was sunny and warm.”" },
      { s: "They planted some trees in the garden.", answer: "True", explain: "“Then we planted some trees in the garden.”" },
      { s: "They came back to school at five o'clock.", answer: "False", explain: "“We came back to school at four o'clock.”" },
    ],
  }),
  P({
    id: "my-school", kinds: ["cuoi-hk1"], title: "My school",
    text: `My school is big and beautiful. It has three floors. The library is on the ground floor. The computer room and the music room are on the second floor. The art room is on the third floor.

My favourite school activity is reading books. I go to the library every Monday because I think reading is interesting. My friend Hoa likes drawing pictures, so she often goes to the art room. Last week, we were at the stadium for our school sports day.`,
    tf: [
      { s: "The school has three floors.", answer: "True", explain: "“It has three floors.”" },
      { s: "The library is on the second floor.", answer: "False", explain: "“The library is on the ground floor.”" },
      { s: "Hoa likes drawing pictures.", answer: "True", explain: "“My friend Hoa likes drawing pictures.”" },
      { s: "Last week, they were at the zoo.", answer: "False", explain: "“Last week, we were at the stadium for our school sports day.”" },
    ],
  }),

  /* ═════════════ GIỮA HỌC KÌ II (Unit 11–15) ═════════════ */
  P({
    id: "tet-at-grandparents", kinds: ["giua-hk2"], title: "Tet at my grandparents' house",
    text: `Tet is coming soon. This year, my family will go to my grandparents' house in Nam Dinh. We will make banh chung with my grandma. My father will decorate the house with peach flowers.

On the first day of Tet, I will wear new clothes and get lucky money. In the evening, we will go to the pagoda. I'm very happy because I love Tet.`,
    tf: [
      { s: "The family will go to Nam Dinh at Tet.", answer: "True", explain: "“my family will go to my grandparents' house in Nam Dinh”." },
      { s: "They will make banh chung with the grandfather.", answer: "False", explain: "“We will make banh chung with my grandma.”" },
      { s: "The father will decorate the house with peach flowers.", answer: "True", explain: "“My father will decorate the house with peach flowers.”" },
      { s: "They will go to the pagoda in the morning.", answer: "False", explain: "“In the evening, we will go to the pagoda.”" },
    ],
  }),
  P({
    id: "staying-healthy", kinds: ["giua-hk2"], title: "How I stay healthy",
    text: `My name is Phong. I want to be strong and healthy. Every morning, I get up early and do morning exercise. I eat a lot of fruit and vegetables, and I drink fresh juice three times a week. I play badminton with my brother twice a week.

Last week, I had a bad cold. I stayed at home for two days. My mother said, “You should take a rest and drink warm water.” Now I feel much better.`,
    tf: [
      { s: "Phong does morning exercise every morning.", answer: "True", explain: "“Every morning, I get up early and do morning exercise.”" },
      { s: "He drinks fresh juice every day.", answer: "False", explain: "“I drink fresh juice three times a week.”" },
      { s: "He plays badminton with his brother.", answer: "True", explain: "“I play badminton with my brother twice a week.”" },
      { s: "Last week, he had a toothache.", answer: "False", explain: "“Last week, I had a bad cold.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ II (Unit 11–20) ═════════════ */
  P({
    id: "summer-in-da-nang", kinds: ["cuoi-hk2"], title: "My summer holiday plan",
    text: `This summer, my family is going to visit Da Nang. We are going to get there by plane. It is about 600 kilometres from Ho Chi Minh City to Da Nang.

In Da Nang, the weather is hot and sunny in summer. We are going to stay in a hotel near the beach. I'm going to swim in the sea and build sandcastles with my sister. My father thinks Da Nang is modern and beautiful. I think it's a wonderful place.`,
    tf: [
      { s: "The family is going to Da Nang by plane.", answer: "True", explain: "“We are going to get there by plane.”" },
      { s: "They are going to stay in a tent near the beach.", answer: "False", explain: "“We are going to stay in a hotel near the beach.”" },
      { s: "The weather in Da Nang is hot in summer.", answer: "True", explain: "“the weather is hot and sunny in summer”." },
      { s: "The writer is going to build sandcastles with her brother.", answer: "False", explain: "“build sandcastles with my sister”." },
    ],
  }),
  P({
    id: "hare-and-tortoise", kinds: ["cuoi-hk2"], title: "A story I like",
    text: `My favourite story is The Hare and the Tortoise. The main characters are a hare and a tortoise. One day, they had a race. The hare ran very fast, so he stopped and slept under a tree. The tortoise walked slowly, but he did not stop.

When the hare woke up, the tortoise was near the finish line. The hare ran quickly, but it was too late. The tortoise won the race. I like this story because it teaches us to work hard and never give up.`,
    tf: [
      { s: "The main characters are a hare and a tortoise.", answer: "True", explain: "“The main characters are a hare and a tortoise.”" },
      { s: "The hare slept under a tree.", answer: "True", explain: "“he stopped and slept under a tree”." },
      { s: "The tortoise walked fast.", answer: "False", explain: "“The tortoise walked slowly.”" },
      { s: "The hare won the race.", answer: "False", explain: "“The tortoise won the race.”" },
    ],
  }),
];

export const EN5: EnContent = {
  grade: 5,
  book: "Tiếng Anh 5 Global Success",
  units: UNITS,
  passages: PASSAGES,
  words: [60, 110],
  apart: [["nơi ở", "phòng trong trường"]],
};
