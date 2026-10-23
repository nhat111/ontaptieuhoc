// lib/exam5/enContent3.ts
// Nội dung đề Tiếng Anh lớp 3 theo Tiếng Anh 3 Global Success (Kết nối tri thức) — VIẾT TAY,
// không chép sách: hội thoại, nhóm từ, câu ngữ pháp dựng theo chủ đề và mẫu câu của từng Unit
// (tên Unit theo mục lục, đối chiếu hoatieu.vn, 10/2026; mẫu câu soạn theo chủ đề, CHƯA đối
// chiếu từng bài trong sách); bài đọc tự soạn, câu rất ngắn. CẦN NGƯỜI DUYỆT.
// Quy tắc như ./enContent5.ts.

import type { EnContent, EnUnit, EnPassage } from "./tiengAnh";

const U = (u: EnUnit) => u;
const P = (p: EnPassage) => p;

const UNITS: EnUnit[] = [
  /* ═════════════ TẬP MỘT ═════════════ */
  U({
    n: 1, title: "Hello",
    qa: [
      { q: "Hello. I'm Mai.", a: "Hi, Mai. I'm Ben.", key: "Ben", wrong: ["Bill", "Lucy"] },
      { q: "Hello, I'm Lucy. What's your name?", a: "Hi, Lucy. I'm Nam.", key: "Nam", wrong: ["Nga", "Lan"] },
      { q: "Hi. I'm Nam.", a: "Hello, Nam. I'm Linh.", key: "Linh", wrong: ["Lucy", "Mary"] },
      { q: "Goodbye, Mai.", a: "Bye, Nam. See you later.", key: "later", wrong: ["soon", "again"] },
    ],
    groups: { "lời chào": ["hello", "hi", "goodbye", "bye"] },
    gram: [
      { q: "Hello. ___ Minh.", options: ["I'm", "You're", "It's"], answer: "I'm", explain: "Tự giới thiệu: I'm + tên." },
      { q: "How ___ you? – I'm fine, thank you.", options: ["are", "is", "am"], answer: "are", explain: "Hỏi thăm sức khoẻ: How are you?" },
      { q: "Goodbye. – ___.", options: ["Bye", "Hello", "Hi"], answer: "Bye", explain: "Đáp lời tạm biệt: Bye." },
    ],
    sentences: ["My name is Mai.", "Nice to meet you."],
  }),
  U({
    n: 2, title: "Our names",
    qa: [
      { q: "What's your name?", a: "My name's Lucy.", key: "Lucy", wrong: ["Linda", "Mary"] },
      { q: "How do you spell your name?", a: "B-E-N.", key: "B-E-N", wrong: ["B-I-N", "P-E-N"] },
      { q: "How old are you?", a: "I'm eight years old.", key: "eight", wrong: ["seven", "nine"] },
      { q: "How old are you, Nam?", a: "I'm nine. And you?", key: "nine", wrong: ["five", "eight"] },
    ],
    groups: { "số đếm": ["one", "two", "three", "seven", "eight", "nine", "ten"] },
    gram: [
      { q: "What's ___ name? – My name's Ben.", options: ["your", "you", "I"], answer: "your", explain: "Hỏi tên: What's your name?" },
      { q: "How ___ are you? – I'm eight.", options: ["old", "are", "many"], answer: "old", explain: "Hỏi tuổi: How old are you?" },
      { q: "My name ___ Linh.", options: ["is", "are", "am"], answer: "is", explain: "My name is + tên." },
    ],
    sentences: ["I am eight years old.", "My name is Ben."],
  }),
  U({
    n: 3, title: "Our friends",
    qa: [
      { q: "Who's this?", a: "It's my friend Nam.", key: "Nam", wrong: ["Minh", "Mai"] },
      { q: "Who's that?", a: "It's Mary.", key: "Mary", wrong: ["Lucy", "Linda"] },
      { q: "Is this Ben?", a: "Yes, it is. He's my friend.", key: "friend", wrong: ["brother", "teacher"] },
      { q: "Is that Linh?", a: "No, it isn't. It's Mai.", key: "Mai", wrong: ["Lan", "Hoa"] },
    ],
    groups: {},
    gram: [
      { q: "___ this? – It's Minh.", options: ["Who's", "What's", "How's"], answer: "Who's", explain: "Hỏi người: Who's this?" },
      { q: "Is that Mary? – Yes, it ___.", options: ["is", "isn't", "are"], answer: "is", explain: "Trả lời “Yes” → Yes, it is." },
      { q: "Is this Nam? – No, it ___.", options: ["isn't", "is", "aren't"], answer: "isn't", explain: "Trả lời “No” → No, it isn't." },
    ],
    sentences: ["This is my friend Nam.", "That is my friend Mary."],
  }),
  U({
    n: 4, title: "Our bodies",
    qa: [
      { q: "What's this?", a: "It's my nose.", key: "nose", wrong: ["mouth", "face"] },
      { q: "What's that?", a: "It's my hand.", key: "hand", wrong: ["head", "ear"] },
      { q: "Touch your ear, please.", a: "OK. This is my ear.", key: "ear", wrong: ["eye", "face"] },
      { q: "Open your mouth, please.", a: "OK. I open my mouth.", key: "mouth", wrong: ["hand", "book"] },
    ],
    groups: { "bộ phận cơ thể": ["nose", "mouth", "face", "hand", "head", "ear", "eye"] },
    gram: [
      { q: "What's this? – It's ___ ear.", options: ["an", "a", "two"], answer: "an", explain: "“ear” bắt đầu bằng nguyên âm → “an ear”." },
      { q: "___ your eyes, please.", options: ["Open", "Opens", "Opening"], answer: "Open", explain: "Câu yêu cầu bắt đầu bằng động từ nguyên mẫu: Open your eyes." },
      { q: "___ that? – It's my face.", options: ["What's", "Who's", "How's"], answer: "What's", explain: "Hỏi đồ vật, bộ phận: What's that?" },
    ],
    sentences: ["This is my face.", "I have two big eyes."],
  }),
  U({
    n: 5, title: "My hobbies",
    qa: [
      { q: "What's your hobby?", a: "It's singing.", key: "singing", wrong: ["dancing", "drawing"] },
      { q: "What's your hobby, Mai?", a: "It's painting.", key: "painting", wrong: ["running", "cooking"] },
      { q: "What's your hobby, Nam?", a: "It's swimming.", key: "swimming", wrong: ["walking", "running"] },
      { q: "Do you like dancing?", a: "Yes, I do. My hobby is dancing.", key: "dancing", wrong: ["singing", "cooking"] },
    ],
    groups: { "sở thích": ["singing", "dancing", "drawing", "painting", "running", "swimming", "cooking"] },
    gram: [
      { q: "What's your ___? – It's drawing.", options: ["hobby", "name", "friend"], answer: "hobby", explain: "Hỏi sở thích: What's your hobby?" },
      { q: "My hobby ___ running.", options: ["is", "are", "am"], answer: "is", explain: "My hobby is + sở thích." },
      { q: "What's your hobby? – ___ cooking.", options: ["It's", "I'm", "You're"], answer: "It's", explain: "Trả lời sở thích: It's + sở thích." },
    ],
    sentences: ["My hobby is drawing.", "I like singing and dancing."],
  }),
  U({
    n: 6, title: "Our school",
    qa: [
      { q: "Is this our library?", a: "No, it isn't. It's our gym.", key: "gym", wrong: ["art room", "music room"] },
      { q: "Let's go to the playground.", a: "Great! Let's go to the playground.", key: "playground", wrong: ["library", "classroom"] },
      { q: "Is that our gym?", a: "No, it isn't. It's our playground.", key: "playground", wrong: ["library", "classroom"] },
      { q: "Where do you go?", a: "I go to the computer room.", key: "computer room", wrong: ["music room", "art room"] },
    ],
    groups: { "nơi trong trường": ["classroom", "library", "gym", "playground", "computer room", "music room", "art room"] },
    gram: [
      { q: "___ go to the music room.", options: ["Let's", "Let", "Lets"], answer: "Let's", explain: "Rủ cùng làm: Let's + động từ." },
      { q: "Is this our library? – No, it ___.", options: ["isn't", "is", "aren't"], answer: "isn't", explain: "Trả lời “No” → No, it isn't." },
      { q: "That is ___ art room.", options: ["our", "we", "us"], answer: "our", explain: "Trước danh từ dùng tính từ sở hữu “our”." },
    ],
    sentences: ["This is our school library.", "Let's go to the gym."],
  }),
  U({
    n: 7, title: "Classroom instructions",
    qa: [
      { q: "May I come in?", a: "Yes, you can. Sit down, please.", key: "Sit down", wrong: ["Stand up", "Come here"] },
      { q: "May I go out?", a: "No, you can't. Open your notebook, please.", key: "notebook", wrong: ["book", "pencil case"] },
      { q: "What does the teacher say?", a: "Open your book, please.", key: "Open", wrong: ["Close", "Take"] },
      { q: "What does Miss Hoa say?", a: "Stand up, please.", key: "Stand up", wrong: ["Sit down", "Come here"] },
    ],
    groups: { "lời yêu cầu trong lớp": ["stand up", "sit down", "open your book", "close your book", "come here"] },
    gram: [
      { q: "___ I go out? – Yes, you can.", options: ["May", "Do", "Am"], answer: "May", explain: "Xin phép: May I …?" },
      { q: "May I ask a question? – No, you ___.", options: ["can't", "don't", "aren't"], answer: "can't", explain: "Từ chối lời xin phép: No, you can't." },
      { q: "___ down, please.", options: ["Sit", "Sits", "Sitting"], answer: "Sit", explain: "Câu yêu cầu: Sit down, please." },
    ],
    sentences: ["Please open your book.", "Please sit down now."],
  }),
  U({
    n: 8, title: "My school things",
    qa: [
      { q: "Do you have a ruler?", a: "Yes, I do. I have a ruler.", key: "ruler", wrong: ["rubber", "pencil"] },
      { q: "Do you have a pencil case?", a: "No, I don't. I have a school bag.", key: "school bag", wrong: ["notebook", "book"] },
      { q: "What do you have?", a: "I have a pen.", key: "pen", wrong: ["pencil", "book"] },
      { q: "What's this?", a: "It's my notebook.", key: "notebook", wrong: ["pencil case", "rubber"] },
    ],
    groups: { "đồ dùng học tập": ["ruler", "rubber", "pencil", "pen", "book", "notebook", "school bag", "pencil case"] },
    gram: [
      { q: "___ you have a pencil? – Yes, I do.", options: ["Do", "Are", "Is"], answer: "Do", explain: "Hỏi có … không: Do you have …?" },
      { q: "Do you have a rubber? – No, I ___.", options: ["don't", "do", "can't"], answer: "don't", explain: "Câu hỏi với “Do” → trả lời No, I don't." },
      { q: "I have ___ eraser.", options: ["an", "a", "two"], answer: "an", explain: "“eraser” bắt đầu bằng nguyên âm → “an eraser”." },
    ],
    sentences: ["I have a new pencil.", "This is my school bag."],
  }),
  U({
    n: 9, title: "Colours",
    qa: [
      { q: "What colour is it?", a: "It's red.", key: "red", wrong: ["blue", "green"] },
      { q: "What colour is your school bag?", a: "It's blue.", key: "blue", wrong: ["black", "brown"] },
      { q: "What colour are your pencils?", a: "They're green.", key: "green", wrong: ["yellow", "white"] },
      { q: "What colour are they?", a: "They're yellow.", key: "yellow", wrong: ["orange", "pink"] },
    ],
    groups: { "màu sắc": ["red", "blue", "green", "black", "yellow", "white", "orange", "pink", "brown"] },
    gram: [
      { q: "What colour ___ your pens? – They're black.", options: ["are", "is", "am"], answer: "are", explain: "“your pens” số nhiều → “are”." },
      { q: "What colour is your ruler? – ___ white.", options: ["It's", "They're", "I'm"], answer: "It's", explain: "Một đồ vật → “It's”." },
      { q: "___ colour is it? – It's pink.", options: ["What", "Who", "How"], answer: "What", explain: "Hỏi màu: What colour …?" },
    ],
    sentences: ["My school bag is blue.", "The pens are red."],
  }),
  U({
    n: 10, title: "Break time activities",
    qa: [
      { q: "What do you do at break time?", a: "I play football.", key: "football", wrong: ["basketball", "volleyball"] },
      { q: "What do you do at break time, Mai?", a: "I play chess.", key: "chess", wrong: ["badminton", "football"] },
      { q: "Do you like word puzzles?", a: "Yes, I do. I do word puzzles at break time.", key: "word puzzles", wrong: ["jigsaw puzzles", "crosswords"] },
      { q: "Do you like badminton?", a: "No, I don't. I like table tennis.", key: "table tennis", wrong: ["volleyball", "football"] },
    ],
    groups: { "trò chơi, môn thể thao": ["football", "basketball", "volleyball", "chess", "badminton", "table tennis"] },
    gram: [
      { q: "What do you do ___ break time?", options: ["at", "in", "on"], answer: "at", explain: "Vào giờ ra chơi: at break time." },
      { q: "I ___ basketball at break time.", options: ["play", "do", "go"], answer: "play", explain: "Chơi môn thể thao, trò chơi: play + môn." },
      { q: "Do you like chess? – Yes, I ___.", options: ["do", "am", "like"], answer: "do", explain: "Câu hỏi với “Do” → Yes, I do." },
    ],
    sentences: ["I play chess at break time.", "We play football at break time."],
  }),

  /* ═════════════ TẬP HAI ═════════════ */
  U({
    n: 11, title: "My family",
    qa: [
      { q: "Who's this?", a: "It's my father.", key: "father", wrong: ["mother", "brother"] },
      { q: "Who's that?", a: "It's my grandmother.", key: "grandmother", wrong: ["grandfather", "sister"] },
      { q: "How old is your brother?", a: "He's twelve years old.", key: "twelve", wrong: ["twenty", "two"] },
      { q: "How old is your sister?", a: "She's six years old.", key: "six", wrong: ["seven", "sixteen"] },
    ],
    groups: { "người trong gia đình": ["father", "mother", "brother", "sister", "grandfather", "grandmother"] },
    gram: [
      { q: "How old ___ your mother?", options: ["is", "are", "am"], answer: "is", explain: "“your mother” một người → “is”." },
      { q: "Who's that? – ___ my grandfather.", options: ["It's", "He", "They're"], answer: "It's", explain: "Trả lời câu hỏi Who's that?: It's + người." },
      { q: "How old is your brother? – ___ ten.", options: ["He's", "She's", "I'm"], answer: "He's", explain: "“brother” là nam → He's." },
    ],
  }),
  U({
    n: 12, title: "Jobs",
    qa: [
      { q: "What's his job?", a: "He's a doctor.", key: "doctor", wrong: ["driver", "farmer"] },
      { q: "What's her job?", a: "She's a teacher.", key: "teacher", wrong: ["nurse", "singer"] },
      { q: "What's your father's job?", a: "He's a farmer.", key: "farmer", wrong: ["worker", "cook"] },
      { q: "Is she a nurse?", a: "Yes, she is. She's a nurse.", key: "nurse", wrong: ["doctor", "cook"] },
    ],
    groups: { "nghề nghiệp": ["doctor", "driver", "farmer", "teacher", "nurse", "singer", "worker", "cook"] },
    gram: [
      { q: "What's ___ job? – She's a singer.", options: ["her", "his", "your"], answer: "her", explain: "Câu trả lời nói “She” → hỏi “her job”." },
      { q: "He's ___ cook.", options: ["a", "an", "two"], answer: "a", explain: "“cook” bắt đầu bằng phụ âm → “a cook”." },
      { q: "Is he a driver? – No, he ___.", options: ["isn't", "is", "aren't"], answer: "isn't", explain: "Trả lời “No” → No, he isn't." },
    ],
  }),
  U({
    n: 13, title: "My house",
    qa: [
      { q: "Where's the kitchen?", a: "It's next to the living room.", key: "living room", wrong: ["bedroom", "bathroom"] },
      { q: "Is there a garden?", a: "Yes, there is. It's big.", key: "big", wrong: ["small", "old"] },
      { q: "Where's your bedroom?", a: "It's next to the bathroom.", key: "bathroom", wrong: ["kitchen", "garden"] },
      { q: "Is there a bathroom?", a: "Yes, there is. It's small.", key: "small", wrong: ["big", "new"] },
    ],
    groups: { "phòng trong nhà": ["kitchen", "bedroom", "bathroom", "living room", "garden"] },
    gram: [
      { q: "___ the living room? – It's there.", options: ["Where's", "What's", "Who's"], answer: "Where's", explain: "Hỏi vị trí: Where's …?" },
      { q: "Is there a kitchen? – Yes, there ___.", options: ["is", "are", "it"], answer: "is", explain: "Câu hỏi “Is there …?” → Yes, there is." },
      { q: "There ___ a big garden.", options: ["is", "are", "am"], answer: "is", explain: "“a big garden” số ít → There is." },
    ],
  }),
  U({
    n: 14, title: "My bedroom",
    qa: [
      { q: "What's in your bedroom?", a: "There's a bed.", key: "bed", wrong: ["desk", "lamp"] },
      { q: "How many chairs are there?", a: "There are two chairs.", key: "two", wrong: ["three", "four"] },
      { q: "What's your bedroom like?", a: "It's small but nice.", key: "small", wrong: ["big", "old"] },
      { q: "Where's the lamp?", a: "It's on the desk.", key: "desk", wrong: ["bed", "chair"] },
    ],
    groups: { "đồ vật trong phòng": ["bed", "desk", "lamp", "chair", "window", "door"] },
    gram: [
      { q: "There ___ two windows in my room.", options: ["are", "is", "am"], answer: "are", explain: "“two windows” số nhiều → There are." },
      { q: "There ___ a lamp on the desk.", options: ["is", "are", "be"], answer: "is", explain: "“a lamp” số ít → There is." },
      { q: "How ___ doors are there? – There is one.", options: ["many", "old", "much"], answer: "many", explain: "Hỏi số lượng: How many …?" },
    ],
  }),
  U({
    n: 15, title: "At the dining table",
    qa: [
      { q: "What would you like to eat?", a: "I'd like some rice.", key: "rice", wrong: ["bread", "fish"] },
      { q: "What would you like to drink?", a: "I'd like some milk.", key: "milk", wrong: ["juice", "water"] },
      { q: "Would you like some bread?", a: "Yes, please. I'd like some bread and eggs.", key: "eggs", wrong: ["milk", "fish"] },
      { q: "Would you like some chicken?", a: "No, thanks. I'd like some fish.", key: "fish", wrong: ["meat", "eggs"] },
    ],
    groups: { "đồ ăn": ["rice", "bread", "fish", "chicken", "meat", "eggs"], "đồ uống": ["milk", "juice", "water", "lemonade"] },
    gram: [
      { q: "What would you like to ___? – I'd like some water.", options: ["drink", "eat", "do"], answer: "drink", explain: "“water” là đồ uống → What would you like to drink?" },
      { q: "Would you like some juice? – Yes, ___.", options: ["please", "thanks", "no"], answer: "please", explain: "Nhận lời mời: Yes, please." },
      { q: "I'd like ___ bread.", options: ["some", "a", "an"], answer: "some", explain: "“bread” không đếm được → some bread." },
    ],
  }),
  U({
    n: 16, title: "My pets",
    qa: [
      { q: "Do you have any cats?", a: "Yes, I do. I have a cat.", key: "cat", wrong: ["dog", "rabbit"] },
      { q: "Do you have any dogs?", a: "No, I don't. I have a rabbit.", key: "rabbit", wrong: ["parrot", "goldfish"] },
      { q: "How many parrots do you have?", a: "I have two parrots.", key: "two", wrong: ["three", "four"] },
      { q: "How many goldfish do you have?", a: "I have five goldfish.", key: "five", wrong: ["four", "nine"] },
    ],
    groups: { "vật nuôi": ["cat", "dog", "rabbit", "parrot", "goldfish"] },
    gram: [
      { q: "Do you have ___ dogs? – Yes, I do.", options: ["any", "a", "an"], answer: "any", explain: "Câu hỏi với danh từ số nhiều: Do you have any …?" },
      { q: "How many cats ___ you have?", options: ["do", "does", "are"], answer: "do", explain: "Chủ ngữ “you” → trợ động từ “do”." },
      { q: "I have three ___.", options: ["rabbits", "rabbit", "a rabbit"], answer: "rabbits", explain: "Số lượng nhiều hơn một → danh từ thêm -s." },
    ],
  }),
  U({
    n: 17, title: "Our toys",
    qa: [
      { q: "What toys do you have?", a: "I have a teddy bear.", key: "teddy bear", wrong: ["robot", "doll"] },
      { q: "What toys does he have?", a: "He has a car.", key: "car", wrong: ["kite", "ball"] },
      { q: "What toys does she have?", a: "She has a doll.", key: "doll", wrong: ["ship", "plane"] },
      { q: "How many kites do you have?", a: "I have three kites.", key: "three", wrong: ["two", "four"] },
    ],
    groups: { "đồ chơi": ["teddy bear", "robot", "doll", "car", "kite", "ball", "ship", "plane"] },
    gram: [
      { q: "She ___ a robot.", options: ["has", "have", "is"], answer: "has", explain: "Chủ ngữ “She” → “has”." },
      { q: "I ___ two balls.", options: ["have", "has", "am"], answer: "have", explain: "Chủ ngữ “I” → “have”." },
      { q: "What toys ___ he have?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
    ],
  }),
  U({
    n: 18, title: "Playing and doing",
    qa: [
      { q: "What are you doing?", a: "I'm reading.", key: "reading", wrong: ["writing", "drawing"] },
      { q: "What are you doing, Linh?", a: "I'm listening to music.", key: "music", wrong: ["the radio", "the teacher"] },
      { q: "Are you painting?", a: "Yes, I am. I'm painting a picture.", key: "picture", wrong: ["house", "car"] },
      { q: "Are you singing?", a: "No, I'm not. I'm dancing.", key: "dancing", wrong: ["cooking", "drawing"] },
    ],
    groups: { "hoạt động đang làm": ["reading", "writing", "listening to music", "watching TV", "playing the piano"] },
    gram: [
      { q: "What are you ___? – I'm writing.", options: ["doing", "do", "does"], answer: "doing", explain: "Hỏi việc đang làm: What are you doing?" },
      { q: "I'm ___ a book.", options: ["reading", "read", "reads"], answer: "reading", explain: "Đang làm: I'm + động từ thêm -ing." },
      { q: "Are you drawing? – Yes, I ___.", options: ["am", "do", "is"], answer: "am", explain: "Câu hỏi “Are you …?” → Yes, I am." },
    ],
  }),
  U({
    n: 19, title: "Outdoor activities",
    qa: [
      { q: "What's he doing?", a: "He's cycling.", key: "cycling", wrong: ["skating", "skipping"] },
      { q: "What's she doing?", a: "She's skipping.", key: "skipping", wrong: ["running", "walking"] },
      { q: "What's Nam doing?", a: "He's flying a kite.", key: "kite", wrong: ["plane", "balloon"] },
      { q: "What's Mary doing?", a: "She's playing badminton.", key: "badminton", wrong: ["football", "chess"] },
    ],
    groups: { "hoạt động ngoài trời": ["cycling", "skating", "skipping", "flying a kite", "walking"] },
    gram: [
      { q: "What's she ___? – She's skating.", options: ["doing", "do", "does"], answer: "doing", explain: "Hỏi việc đang làm: What's she doing?" },
      { q: "He's ___ a kite in the park.", options: ["flying", "fly", "flies"], answer: "flying", explain: "Đang làm: He's + động từ thêm -ing." },
      { q: "What's Ben doing? – ___ cycling.", options: ["He's", "She's", "I'm"], answer: "He's", explain: "Ben là bạn nam → He's." },
    ],
  }),
  U({
    n: 20, title: "At the zoo",
    qa: [
      { q: "What can you see?", a: "I can see a monkey.", key: "monkey", wrong: ["tiger", "horse"] },
      { q: "What can you see at the zoo?", a: "I can see two elephants.", key: "elephants", wrong: ["tigers", "horses"] },
      { q: "What's the monkey doing?", a: "It's swinging.", key: "swinging", wrong: ["counting", "dancing"] },
      { q: "What's the elephant doing?", a: "It's dancing.", key: "dancing", wrong: ["climbing", "swinging"] },
    ],
    groups: { "con vật ở vườn thú": ["monkey", "tiger", "horse", "elephant", "giraffe", "lion"] },
    gram: [
      { q: "I can see ___ elephant.", options: ["an", "a", "two"], answer: "an", explain: "“elephant” bắt đầu bằng nguyên âm → “an”." },
      { q: "What can you ___? – I can see a tiger.", options: ["see", "sees", "seeing"], answer: "see", explain: "Sau “can” dùng động từ nguyên mẫu." },
      { q: "What's the tiger doing? – ___ running.", options: ["It's", "He's", "They're"], answer: "It's", explain: "Nói về một con vật → It's." },
    ],
  }),
];

const PASSAGES: EnPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I (Unit 1–5) ═════════════ */
  P({
    id: "hello-im-mai", kinds: ["giua-hk1"], title: "Hello, I'm Mai",
    text: `Hello. My name is Mai. I'm eight years old. This is my friend Ben. He is nine years old.

My hobby is singing. Ben's hobby is swimming. We are good friends.`,
    tf: [
      { s: "Mai is eight years old.", answer: "True", explain: "“I'm eight years old.”" },
      { s: "Ben is seven years old.", answer: "False", explain: "“He is nine years old.”" },
      { s: "Mai's hobby is singing.", answer: "True", explain: "“My hobby is singing.”" },
      { s: "Ben's hobby is dancing.", answer: "False", explain: "“Ben's hobby is swimming.”" },
    ],
  }),
  P({
    id: "my-friend-linh", kinds: ["giua-hk1"], title: "My friend Linh",
    text: `Hi. I'm Nam. Who's that? It's my friend Linh. She is eight years old.

Linh has big eyes and a small nose. Her hobby is drawing. My hobby is running. We are in the same class.`,
    tf: [
      { s: "Linh is Nam's friend.", answer: "True", explain: "“It's my friend Linh.”" },
      { s: "Linh has a big nose.", answer: "False", explain: "“Linh has big eyes and a small nose.”" },
      { s: "Linh's hobby is drawing.", answer: "True", explain: "“Her hobby is drawing.”" },
      { s: "Nam's hobby is cooking.", answer: "False", explain: "“My hobby is running.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ I (Unit 1–10) ═════════════ */
  P({
    id: "my-school-things", kinds: ["cuoi-hk1"], title: "My school things",
    text: `Hello. I'm Ben. This is my school bag. It is blue. I have two pens, a ruler and a notebook. My pens are red.

At break time, I play football with Nam. Mai and Linh play chess. Our school has a big playground.`,
    tf: [
      { s: "Ben's school bag is blue.", answer: "True", explain: "“This is my school bag. It is blue.”" },
      { s: "Ben has three pens.", answer: "False", explain: "“I have two pens, a ruler and a notebook.”" },
      { s: "At break time, Ben plays football.", answer: "True", explain: "“At break time, I play football with Nam.”" },
      { s: "Mai and Linh play badminton.", answer: "False", explain: "“Mai and Linh play chess.”" },
    ],
  }),
  P({
    id: "our-classroom", kinds: ["cuoi-hk1"], title: "Our classroom",
    text: `This is our classroom. It is big. Our teacher is Miss Hoa. She says, “Stand up, please. Open your book, please.”

My pencil case is pink. My ruler is green. I like the colour green. At break time, I do word puzzles with my friends.`,
    tf: [
      { s: "The classroom is big.", answer: "True", explain: "“This is our classroom. It is big.”" },
      { s: "The pencil case is green.", answer: "False", explain: "“My pencil case is pink.”" },
      { s: "The teacher's name is Miss Hoa.", answer: "True", explain: "“Our teacher is Miss Hoa.”" },
      { s: "At break time, the writer plays football.", answer: "False", explain: "“At break time, I do word puzzles with my friends.”" },
    ],
  }),

  /* ═════════════ GIỮA HỌC KÌ II (Unit 11–15) ═════════════ */
  P({
    id: "my-family-3", kinds: ["giua-hk2"], title: "My family",
    text: `This is my family. My father is a doctor. My mother is a teacher. My brother is twelve years old.

Our house is small, but it has a nice garden. My bedroom is next to the kitchen. There is a bed and a desk in my bedroom. I like rice and fish. My brother likes chicken and milk.`,
    tf: [
      { s: "The father is a doctor.", answer: "True", explain: "“My father is a doctor.”" },
      { s: "The brother is ten years old.", answer: "False", explain: "“My brother is twelve years old.”" },
      { s: "The house has a nice garden.", answer: "True", explain: "“it has a nice garden”." },
      { s: "The writer likes chicken and milk.", answer: "False", explain: "“I like rice and fish. My brother likes chicken and milk.”" },
    ],
  }),
  P({
    id: "dinner-time", kinds: ["giua-hk2"], title: "Dinner time",
    text: `It is dinner time. My family is at the dining table. My grandfather would like some fish. My grandmother would like some rice and eggs.

My sister is six years old. She would like some bread and milk. I would like some chicken and juice. My mother is a cook, so the food is very good.`,
    tf: [
      { s: "The grandfather would like some fish.", answer: "True", explain: "“My grandfather would like some fish.”" },
      { s: "The sister is eight years old.", answer: "False", explain: "“My sister is six years old.”" },
      { s: "The mother is a cook.", answer: "True", explain: "“My mother is a cook.”" },
      { s: "The writer would like some bread and milk.", answer: "False", explain: "“I would like some chicken and juice.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ II (Unit 11–20) ═════════════ */
  P({
    id: "at-the-zoo-3", kinds: ["cuoi-hk2"], title: "At the zoo",
    text: `Today is Sunday. My family is at the zoo. I can see a lot of animals. The monkeys are swinging. The elephant is dancing.

My father is taking photos. My sister is eating ice cream. I like the zoo very much.`,
    tf: [
      { s: "The family is at the zoo.", answer: "True", explain: "“My family is at the zoo.”" },
      { s: "The elephant is swinging.", answer: "False", explain: "“The monkeys are swinging. The elephant is dancing.”" },
      { s: "The father is taking photos.", answer: "True", explain: "“My father is taking photos.”" },
      { s: "The sister is drinking milk.", answer: "False", explain: "“My sister is eating ice cream.”" },
    ],
  }),
  P({
    id: "my-pets-and-toys", kinds: ["cuoi-hk2"], title: "My pets and toys",
    text: `Hi, I'm Lucy. I have two pets: a cat and a parrot. My cat is white. My parrot can talk.

I have a lot of toys. I have a doll, a teddy bear and three balls. Now I'm in the park with my brother. He's flying a kite and I'm skipping.`,
    tf: [
      { s: "Lucy has two pets.", answer: "True", explain: "“I have two pets: a cat and a parrot.”" },
      { s: "Her cat is black.", answer: "False", explain: "“My cat is white.”" },
      { s: "Lucy has three balls.", answer: "True", explain: "“I have a doll, a teddy bear and three balls.”" },
      { s: "Lucy is flying a kite.", answer: "False", explain: "“He's flying a kite and I'm skipping.”" },
    ],
  }),
];

export const EN3: EnContent = {
  grade: 3,
  book: "Tiếng Anh 3 Global Success",
  units: UNITS,
  passages: PASSAGES,
  words: [30, 70],
  apart: [["sở thích", "trò chơi, môn thể thao"], ["hoạt động đang làm", "hoạt động ngoài trời"], ["phòng trong nhà", "đồ vật trong phòng"], ["vật nuôi", "con vật ở vườn thú"]],
};
