// lib/exam5/enContent4.ts
// Nội dung đề Tiếng Anh lớp 4 theo Tiếng Anh 4 Global Success (Kết nối tri thức) — VIẾT TAY,
// không chép sách: hội thoại, nhóm từ, câu ngữ pháp dựng theo chủ đề và mẫu câu của từng Unit
// (mẫu câu đối chiếu phần ngữ pháp từng Unit trên loigiaihay.com, 10/2026); bài đọc tự soạn.
// CẦN NGƯỜI DUYỆT: máy chỉ soát được hình thức (scripts/tieng-anh-check.ts).
// Quy tắc như ./enContent5.ts.

import type { EnContent, EnUnit, EnPassage } from "./tiengAnh";

const U = (u: EnUnit) => u;
const P = (p: EnPassage) => p;

const UNITS: EnUnit[] = [
  /* ═════════════ TẬP MỘT ═════════════ */
  U({
    n: 1, title: "My friends",
    qa: [
      { q: "Where are you from?", a: "I'm from Viet Nam.", key: "Viet Nam", wrong: ["Japan", "Malaysia"] },
      { q: "Where is she from?", a: "She's from Australia.", key: "Australia", wrong: ["America", "Britain"] },
      { q: "Where is your new friend from?", a: "He's from Japan.", key: "Japan", wrong: ["Thailand", "Singapore"] },
      { q: "Where are John and Jess from?", a: "They're from America.", key: "America", wrong: ["Australia", "Britain"] },
    ],
    groups: { "tên nước": ["Viet Nam", "Japan", "Malaysia", "Australia", "America", "Britain", "Thailand", "Singapore"] },
    gram: [
      { q: "Where ___ you from? – I'm from Thailand.", options: ["are", "is", "am"], answer: "are", explain: "Chủ ngữ “you” đi với “are”." },
      { q: "Where is he from? – ___ from Malaysia.", options: ["He's", "She's", "They're"], answer: "He's", explain: "Hỏi về “he” → trả lời “He's from …”." },
      { q: "Mary and Tom ___ from Britain.", options: ["are", "is", "am"], answer: "are", explain: "Hai người (Mary and Tom) → “are”." },
    ],
  }),
  U({
    n: 2, title: "Time and daily routines",
    qa: [
      { q: "What time is it?", a: "It's seven o'clock.", key: "seven", wrong: ["eight", "eleven"] },
      { q: "What time do you get up?", a: "I get up at six o'clock.", key: "six", wrong: ["five", "seven"] },
      { q: "What time do you go to school?", a: "I go to school at half past six.", key: "half past six", wrong: ["half past seven", "six o'clock"] },
      { q: "What time does Nam go to bed?", a: "He goes to bed at nine o'clock.", key: "nine", wrong: ["ten", "five"] },
    ],
    groups: { "việc làm hằng ngày": ["get up", "have breakfast", "go to school", "have lunch", "go to bed"] },
    gram: [
      { q: "What time ___ she get up?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “she” → trợ động từ “does”." },
      { q: "I have lunch ___ eleven thirty.", options: ["at", "in", "on"], answer: "at", explain: "Trước giờ dùng “at”: at eleven thirty." },
      { q: "He ___ to bed at ten o'clock.", options: ["goes", "go", "going"], answer: "goes", explain: "Chủ ngữ “He” → động từ thêm -es: goes." },
    ],
  }),
  U({
    n: 3, title: "My week",
    qa: [
      { q: "What day is it today?", a: "It's Monday.", key: "Monday", wrong: ["Sunday", "Friday"] },
      { q: "What do you do on Saturday?", a: "I help my parents.", key: "help my parents", wrong: ["visit my grandparents", "play football"] },
      { q: "What does Linh do on Sunday?", a: "She does her homework.", key: "homework", wrong: ["housework", "exercise"] },
      { q: "What do they do on Thursday?", a: "They play basketball.", key: "basketball", wrong: ["volleyball", "badminton"] },
    ],
    groups: { "ngày trong tuần": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] },
    gram: [
      { q: "What do you do ___ Sunday?", options: ["on", "in", "at"], answer: "on", explain: "Trước thứ trong tuần dùng “on”." },
      { q: "What ___ he do on Wednesday?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
      { q: "What day is it today? – ___ Tuesday.", options: ["It's", "They're", "I'm"], answer: "It's", explain: "Trả lời thứ trong tuần: It's + thứ." },
    ],
  }),
  U({
    n: 4, title: "My birthday party",
    qa: [
      { q: "When's your birthday?", a: "It's in June.", key: "June", wrong: ["July", "January"] },
      { q: "When's her birthday?", a: "It's in March.", key: "March", wrong: ["May", "August"] },
      { q: "What do you want to eat?", a: "I want some chips.", key: "chips", wrong: ["grapes", "bread"] },
      { q: "What does he want to drink?", a: "He wants some lemon juice.", key: "lemon juice", wrong: ["orange juice", "milk"] },
    ],
    groups: { "tháng trong năm": ["January", "March", "May", "June", "July", "August", "October", "December"] },
    gram: [
      { q: "When's your birthday? – It's ___ October.", options: ["in", "on", "at"], answer: "in", explain: "Trước tháng dùng “in”: in October." },
      { q: "What ___ they want to eat?", options: ["do", "does", "are"], answer: "do", explain: "Chủ ngữ “they” → trợ động từ “do”." },
      { q: "She ___ some grapes.", options: ["wants", "want", "wanting"], answer: "wants", explain: "Chủ ngữ “She” → động từ thêm -s: wants." },
    ],
  }),
  U({
    n: 5, title: "Things we can do",
    qa: [
      { q: "Can you ride a bike?", a: "Yes, I can. I can ride a bike well.", key: "bike", wrong: ["horse", "motorbike"] },
      { q: "Can she cook?", a: "No, she can't, but she can sing.", key: "sing", wrong: ["dance", "swim"] },
      { q: "What can you do?", a: "I can play the piano.", key: "piano", wrong: ["guitar", "violin"] },
      { q: "Can he swim?", a: "No, he can't, but he can roller skate.", key: "roller skate", wrong: ["play chess", "draw"] },
    ],
    groups: { "nhạc cụ": ["piano", "guitar", "violin", "drum"] },
    gram: [
      { q: "Can you ___ a horse?", options: ["ride", "rides", "riding"], answer: "ride", explain: "Sau “can” dùng động từ nguyên mẫu." },
      { q: "Can she swim? – Yes, she ___.", options: ["can", "can't", "does"], answer: "can", explain: "Trả lời “Yes” cho câu hỏi với “Can” → “Yes, she can.”" },
      { q: "He can't cook, ___ he can sing.", options: ["but", "and", "so"], answer: "but", explain: "Hai ý trái ngược (không biết nấu – biết hát) nối bằng “but”." },
    ],
  }),
  U({
    n: 6, title: "Our school facilities",
    qa: [
      { q: "Where's your school?", a: "It's in the village.", key: "village", wrong: ["town", "city"] },
      { q: "Where's Nam's school?", a: "It's in the mountains.", key: "mountains", wrong: ["city", "town"] },
      { q: "How many classrooms are there at your school?", a: "There are twenty classrooms.", key: "twenty", wrong: ["twelve", "thirty"] },
      { q: "How many computer rooms are there at your school?", a: "There are two computer rooms.", key: "two", wrong: ["three", "four"] },
    ],
    groups: { "nơi trong trường": ["classroom", "library", "playground", "computer room", "garden", "gym"] },
    gram: [
      { q: "How many libraries ___ there at your school? – There is one.", options: ["are", "is", "am"], answer: "are", explain: "How many + danh từ số nhiều + are there …?" },
      { q: "There ___ a big playground at my school.", options: ["is", "are", "am"], answer: "is", explain: "“a big playground” số ít → There is." },
      { q: "How ___ classrooms are there?", options: ["many", "much", "old"], answer: "many", explain: "Hỏi số lượng danh từ đếm được: How many …?" },
    ],
  }),
  U({
    n: 7, title: "Our timetables",
    qa: [
      { q: "What subjects do you have today?", a: "I have Maths, English and Music.", key: "Music", wrong: ["Art", "Science"] },
      { q: "What subjects does Nam have today?", a: "He has Vietnamese and PE.", key: "PE", wrong: ["IT", "Art"] },
      { q: "When do you have English?", a: "I have it on Mondays and Fridays.", key: "Fridays", wrong: ["Thursdays", "Tuesdays"] },
      { q: "When does she have Art?", a: "She has it on Wednesdays.", key: "Wednesdays", wrong: ["Mondays", "Saturdays"] },
    ],
    groups: { "môn học": ["Maths", "English", "Music", "Art", "Science", "Vietnamese", "PE", "IT"] },
    gram: [
      { q: "What subjects ___ you have today?", options: ["do", "does", "are"], answer: "do", explain: "Chủ ngữ “you” → trợ động từ “do”." },
      { q: "Mai ___ English on Tuesdays.", options: ["has", "have", "having"], answer: "has", explain: "Chủ ngữ “Mai” (một người) → “has”." },
      { q: "When do you have Science? – I have it ___ Thursdays.", options: ["on", "in", "at"], answer: "on", explain: "Trước thứ trong tuần dùng “on”." },
    ],
  }),
  U({
    n: 8, title: "My favourite subjects",
    qa: [
      { q: "What's your favourite subject?", a: "It's English.", key: "English", wrong: ["Maths", "Science"] },
      { q: "What's her favourite subject?", a: "It's Art.", key: "Art", wrong: ["Music", "PE"] },
      { q: "Why do you like Maths?", a: "Because I want to be a maths teacher.", key: "maths teacher", wrong: ["music teacher", "art teacher"] },
      { q: "Why does he like Science?", a: "Because he wants to be a doctor.", key: "doctor", wrong: ["singer", "farmer"] },
    ],
    groups: { "nghề nghiệp": ["teacher", "doctor", "singer", "farmer", "nurse", "driver"] },
    gram: [
      { q: "Why ___ you like Music?", options: ["do", "does", "are"], answer: "do", explain: "Chủ ngữ “you” → trợ động từ “do”." },
      { q: "___ I want to be a singer.", options: ["Because", "Why", "What"], answer: "Because", explain: "Trả lời câu hỏi “Why” bằng “Because …”." },
      { q: "What's ___ favourite subject? – It's IT.", options: ["your", "you", "you're"], answer: "your", explain: "Trước danh từ dùng tính từ sở hữu “your”." },
    ],
  }),
  U({
    n: 9, title: "Our sports day",
    qa: [
      { q: "When's your sports day?", a: "It's in October.", key: "October", wrong: ["November", "December"] },
      { q: "Is your sports day in September?", a: "No, it isn't. It's in August.", key: "August", wrong: ["April", "May"] },
      { q: "What do you do on sports day?", a: "I play badminton with my friends.", key: "badminton", wrong: ["table tennis", "volleyball"] },
      { q: "Is your sports day in May?", a: "Yes, it is. It's in May.", key: "May", wrong: ["March", "June"] },
    ],
    groups: { "môn thể thao": ["badminton", "table tennis", "volleyball", "football", "basketball", "tug of war"] },
    gram: [
      { q: "Is your sports day in May? – Yes, it ___.", options: ["is", "does", "are"], answer: "is", explain: "Câu hỏi bắt đầu bằng “Is” → trả lời “Yes, it is.”" },
      { q: "Our sports day is ___ November.", options: ["in", "on", "at"], answer: "in", explain: "Trước tháng dùng “in”." },
      { q: "___ your sports day? – It's in December.", options: ["When's", "Where's", "What's"], answer: "When's", explain: "Hỏi thời gian: When's …?" },
    ],
  }),
  U({
    n: 10, title: "Our summer holiday",
    qa: [
      { q: "Where were you last summer?", a: "I was in Da Nang.", key: "Da Nang", wrong: ["Ha Noi", "Hue"] },
      { q: "Were you at the beach last weekend?", a: "No, I wasn't. I was at the zoo.", key: "zoo", wrong: ["park", "campsite"] },
      { q: "Where were you and your friends last summer?", a: "We were at the campsite.", key: "campsite", wrong: ["seaside", "zoo"] },
      { q: "Was she at the zoo yesterday?", a: "No, she wasn't. She was at the park.", key: "park", wrong: ["beach", "market"] },
    ],
    groups: { "nơi đi chơi": ["beach", "campsite", "zoo", "park", "seaside", "countryside"] },
    gram: [
      { q: "Where ___ you last summer?", options: ["were", "was", "are"], answer: "were", explain: "“last summer” → quá khứ; “you” đi với “were”." },
      { q: "She ___ at the beach last weekend.", options: ["was", "were", "is"], answer: "was", explain: "Quá khứ, chủ ngữ “She” → “was”." },
      { q: "We were ___ Bangkok last summer.", options: ["in", "at", "on"], answer: "in", explain: "Trước tên thành phố dùng “in”." },
    ],
  }),

  /* ═════════════ TẬP HAI ═════════════ */
  U({
    n: 11, title: "My home",
    qa: [
      { q: "Where do you live?", a: "I live in a flat in the city.", key: "flat", wrong: ["house", "tower"] },
      { q: "What's your address?", a: "I live at 63 Cau Giay street.", key: "63", wrong: ["36", "73"] },
      { q: "What's the street like?", a: "It's busy and noisy.", key: "busy", wrong: ["quiet", "small"] },
      { q: "What's your village like?", a: "It's quiet and beautiful.", key: "quiet", wrong: ["noisy", "busy"] },
    ],
    groups: { "nơi ở": ["flat", "house", "village", "city", "town"] },
    gram: [
      { q: "I live ___ 25 Le Loi street.", options: ["at", "on", "in"], answer: "at", explain: "Địa chỉ có số nhà dùng “at”." },
      { q: "What's the street ___? – It's quiet.", options: ["like", "likes", "to like"], answer: "like", explain: "Hỏi đặc điểm: What's … like?" },
      { q: "Where ___ your grandparents live?", options: ["do", "does", "are"], answer: "do", explain: "“your grandparents” số nhiều → trợ động từ “do”." },
    ],
  }),
  U({
    n: 12, title: "Jobs",
    qa: [
      { q: "What does she do?", a: "She's a nurse.", key: "nurse", wrong: ["teacher", "worker"] },
      { q: "What does he do?", a: "He's a farmer.", key: "farmer", wrong: ["driver", "cook"] },
      { q: "Where does she work?", a: "She works in a hospital.", key: "hospital", wrong: ["school", "factory"] },
      { q: "Where does your father work?", a: "He works in a factory.", key: "factory", wrong: ["office", "hospital"] },
    ],
    groups: { "nơi làm việc": ["hospital", "factory", "office", "school", "farm"] },
    gram: [
      { q: "What does your mother ___? – She's a teacher.", options: ["do", "does", "doing"], answer: "do", explain: "Sau “does” dùng động từ nguyên mẫu: What does … do?" },
      { q: "He ___ on a farm.", options: ["works", "work", "working"], answer: "works", explain: "Chủ ngữ “He” → động từ thêm -s: works." },
      { q: "My uncle is ___ office worker.", options: ["an", "a", "the"], answer: "an", explain: "“office” bắt đầu bằng nguyên âm → “an”." },
    ],
  }),
  U({
    n: 13, title: "Appearance",
    qa: [
      { q: "What does she look like?", a: "She's tall and slim.", key: "slim", wrong: ["big", "short"] },
      { q: "What does he look like?", a: "He has short black hair.", key: "short", wrong: ["long", "curly"] },
      { q: "What does your brother look like?", a: "He's short and big.", key: "big", wrong: ["slim", "tall"] },
      { q: "What do they look like?", a: "They have round faces.", key: "round", wrong: ["long", "small"] },
    ],
    groups: { "bộ phận cơ thể": ["hair", "eyes", "face", "nose", "ears"] },
    gram: [
      { q: "What does she look ___?", options: ["like", "likes", "at"], answer: "like", explain: "Hỏi ngoại hình: What does … look like?" },
      { q: "My sister ___ long hair.", options: ["has", "have", "is"], answer: "has", explain: "Chủ ngữ “My sister” → “has”." },
      { q: "What do your parents look like? – ___ tall.", options: ["They're", "He's", "It's"], answer: "They're", explain: "“your parents” số nhiều → “They're”." },
    ],
  }),
  U({
    n: 14, title: "Daily activities",
    qa: [
      { q: "When do you clean the floor?", a: "I clean the floor in the evening.", key: "evening", wrong: ["morning", "afternoon"] },
      { q: "When does she wash the dishes?", a: "She washes the dishes after dinner.", key: "dinner", wrong: ["lunch", "breakfast"] },
      { q: "What do you do in the morning?", a: "I often do morning exercise.", key: "morning exercise", wrong: ["my homework", "the cooking"] },
      { q: "What does Linda do at noon?", a: "She has lunch with her friends.", key: "lunch", wrong: ["dinner", "breakfast"] },
    ],
    groups: { "việc nhà": ["clean the floor", "wash the dishes", "water the plants", "cook dinner", "do the laundry"] },
    gram: [
      { q: "When ___ he water the plants?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
      { q: "She ___ the dishes after meals.", options: ["washes", "wash", "washs"], answer: "washes", explain: "Chủ ngữ “She”; “wash” tận cùng -sh → thêm -es." },
      { q: "I do my homework ___ the afternoon.", options: ["in", "on", "at"], answer: "in", explain: "Buổi trong ngày dùng “in”: in the afternoon." },
    ],
  }),
  U({
    n: 15, title: "My family's weekends",
    qa: [
      { q: "Where does she go on Saturdays?", a: "She goes to the cinema.", key: "cinema", wrong: ["bookshop", "supermarket"] },
      { q: "Where do your friends go on Fridays?", a: "They go to the swimming pool.", key: "swimming pool", wrong: ["sports centre", "shopping centre"] },
      { q: "What does he do on Sundays?", a: "He does yoga.", key: "yoga", wrong: ["karate", "judo"] },
      { q: "What does Nam do on Mondays?", a: "He plays tennis with his sister.", key: "tennis", wrong: ["chess", "football"] },
    ],
    groups: { "nơi đi vào cuối tuần": ["cinema", "bookshop", "supermarket", "swimming pool", "sports centre"] },
    gram: [
      { q: "Where ___ he go on Saturdays?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
      { q: "My mother ___ to the market on Sundays.", options: ["goes", "go", "going"], answer: "goes", explain: "Chủ ngữ “My mother” → động từ thêm -es: goes." },
      { q: "What do you and your sister do ___ Saturdays?", options: ["on", "in", "at"], answer: "on", explain: "Trước thứ trong tuần dùng “on”." },
    ],
  }),
  U({
    n: 16, title: "Weather",
    qa: [
      { q: "What was the weather like yesterday?", a: "It was sunny.", key: "sunny", wrong: ["rainy", "windy"] },
      { q: "What was the weather like last weekend?", a: "It was cloudy and cool.", key: "cloudy", wrong: ["sunny", "stormy"] },
      { q: "Do you want to go to the water park?", a: "Great! Let's go. It's hot today.", key: "hot", wrong: ["cold", "cool"] },
      { q: "Do you want to go to the zoo?", a: "Sorry, I can't. It's rainy.", key: "rainy", wrong: ["sunny", "hot"] },
    ],
    groups: { "từ chỉ thời tiết": ["sunny", "rainy", "windy", "cloudy", "stormy"] },
    gram: [
      { q: "What ___ the weather like yesterday?", options: ["was", "were", "is"], answer: "was", explain: "“yesterday” → quá khứ; “the weather” đi với “was”." },
      { q: "It ___ rainy last Sunday.", options: ["was", "is", "were"], answer: "was", explain: "“last Sunday” → quá khứ: It was." },
      { q: "Do you want ___ go to the park?", options: ["to", "for", "at"], answer: "to", explain: "want + to + động từ nguyên mẫu." },
    ],
  }),
  U({
    n: 17, title: "In the city",
    qa: [
      { q: "How can I get to the bookshop?", a: "Go straight and turn right.", key: "right", wrong: ["left", "back"] },
      { q: "How can I get to the post office?", a: "Turn left at the traffic lights.", key: "left", wrong: ["right", "back"] },
      { q: "What does it say?", a: "It says “Stop”.", key: "Stop", wrong: ["Go", "Wait"] },
      { q: "Where's the bakery?", a: "It's on your left.", key: "left", wrong: ["right", "back"] },
    ],
    groups: { "nơi trong thành phố": ["museum", "post office", "bakery", "pharmacy", "bus stop"] },
    gram: [
      { q: "___ can I get to the bus stop?", options: ["How", "What", "Who"], answer: "How", explain: "Hỏi đường: How can I get to …?" },
      { q: "Go straight and turn left ___ the traffic lights.", options: ["at", "on", "in"], answer: "at", explain: "Rẽ ở cột đèn giao thông: turn left at the traffic lights." },
      { q: "The bookshop is ___ your right.", options: ["on", "in", "at"], answer: "on", explain: "Ở bên phải bạn: on your right." },
    ],
  }),
  U({
    n: 18, title: "At the shopping centre",
    qa: [
      { q: "Where's the gift shop?", a: "It's next to the bakery.", key: "bakery", wrong: ["cinema", "bookshop"] },
      { q: "Where's the food court?", a: "It's opposite the cinema.", key: "opposite", wrong: ["behind", "near"] },
      { q: "How much is the shirt?", a: "It's 120,000 dong.", key: "120,000", wrong: ["100,000", "200,000"] },
      { q: "How much are the shoes?", a: "They're 150,000 dong.", key: "150,000", wrong: ["50,000", "105,000"] },
    ],
    groups: { "quần áo, giày dép": ["shirt", "jacket", "skirt", "T-shirt", "shoes", "jeans"] },
    gram: [
      { q: "How much ___ the jacket?", options: ["is", "are", "am"], answer: "is", explain: "“the jacket” số ít → How much is …?" },
      { q: "How much are the socks? – ___ 20,000 dong.", options: ["They're", "It's", "He's"], answer: "They're", explain: "“the socks” số nhiều → They're." },
      { q: "The bookshop is ___ to the cinema.", options: ["next", "near", "opposite"], answer: "next", explain: "Bên cạnh: next to." },
    ],
  }),
  U({
    n: 19, title: "The animal world",
    qa: [
      { q: "What are these animals?", a: "They're lions.", key: "lions", wrong: ["tigers", "bears"] },
      { q: "What are those animals?", a: "They're giraffes.", key: "giraffes", wrong: ["zebras", "camels"] },
      { q: "Why do you like hippos?", a: "Because they're big.", key: "big", wrong: ["small", "fast"] },
      { q: "Why does your sister like monkeys?", a: "Because they can climb trees.", key: "climb", wrong: ["jump", "swim"] },
    ],
    groups: { "con vật": ["lions", "tigers", "giraffes", "zebras", "hippos", "monkeys", "crocodiles"] },
    gram: [
      { q: "What are ___ animals? – They're zebras.", options: ["those", "this", "that"], answer: "those", explain: "“animals” số nhiều → dùng “these/those”." },
      { q: "Why do you like elephants? – Because ___ very smart.", options: ["they're", "it's", "he's"], answer: "they're", explain: "“elephants” số nhiều → they're." },
      { q: "Why ___ he like crocodiles?", options: ["does", "do", "is"], answer: "does", explain: "Chủ ngữ “he” → trợ động từ “does”." },
    ],
  }),
  U({
    n: 20, title: "At summer camp",
    qa: [
      { q: "What's he doing?", a: "He's putting up the tent.", key: "tent", wrong: ["flag", "kite"] },
      { q: "What are they doing?", a: "They're playing tug of war.", key: "tug of war", wrong: ["volleyball", "hide and seek"] },
      { q: "What's she doing?", a: "She's singing around the campfire.", key: "singing", wrong: ["dancing", "sitting"] },
      { q: "What are your friends doing?", a: "They're telling stories.", key: "stories", wrong: ["jokes", "songs"] },
    ],
    groups: { "hoạt động ở trại hè": ["putting up a tent", "singing around the campfire", "telling stories", "playing tug of war", "dancing"] },
    gram: [
      { q: "What ___ she doing? – She's dancing.", options: ["is", "are", "does"], answer: "is", explain: "Hỏi việc đang làm: What is she doing?" },
      { q: "They're ___ around the campfire.", options: ["singing", "sing", "sings"], answer: "singing", explain: "Đang làm: be + động từ thêm -ing." },
      { q: "What are the boys ___? – They're playing football.", options: ["doing", "do", "does"], answer: "doing", explain: "Mẫu câu: What are … doing?" },
    ],
  }),
];

const PASSAGES: EnPassage[] = [
  /* ═════════════ GIỮA HỌC KÌ I (Unit 1–5) ═════════════ */
  P({
    id: "my-friend-akiko", kinds: ["giua-hk1"], title: "My friend Akiko",
    text: `Hello, I'm Lan. This is my friend Akiko. She is from Japan. Every day, she gets up at six o'clock and goes to school at half past six.

Her birthday is in May. At her birthday party, she wants some chips and orange juice. Akiko can play the piano very well, but she can't swim. On Sundays, she plays badminton with me.`,
    tf: [
      { s: "Akiko is from Japan.", answer: "True", explain: "“She is from Japan.”" },
      { s: "She gets up at seven o'clock.", answer: "False", explain: "“she gets up at six o'clock”." },
      { s: "Her birthday is in May.", answer: "True", explain: "“Her birthday is in May.”" },
      { s: "Akiko can swim very well.", answer: "False", explain: "“she can't swim”." },
    ],
  }),
  P({
    id: "bens-week", kinds: ["giua-hk1"], title: "Ben's week",
    text: `My name is Ben. I'm from Australia. I'm nine years old. I go to school from Monday to Friday. On Saturday, I help my parents in the garden. On Sunday, I visit my grandparents.

I can ride a bike and I can cook. My birthday is in October. I want a big cake and some lemon juice at my party.`,
    tf: [
      { s: "Ben is from Australia.", answer: "True", explain: "“I'm from Australia.”" },
      { s: "He goes to school on Saturday.", answer: "False", explain: "“I go to school from Monday to Friday.”" },
      { s: "On Sunday, he visits his grandparents.", answer: "True", explain: "“On Sunday, I visit my grandparents.”" },
      { s: "His birthday is in December.", answer: "False", explain: "“My birthday is in October.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ I (Unit 1–10) ═════════════ */
  P({
    id: "our-school", kinds: ["cuoi-hk1"], title: "Our school",
    text: `My school is in the town. It is big and beautiful. There are twenty classrooms, a library and two computer rooms.

Today is Wednesday. I have Maths, English and Art. My favourite subject is English because I want to be an English teacher. Our sports day is in November. Last summer, I was in Nha Trang with my family. We were at the beach every day.`,
    tf: [
      { s: "The school is in the town.", answer: "True", explain: "“My school is in the town.”" },
      { s: "There are two libraries at the school.", answer: "False", explain: "“There are twenty classrooms, a library and two computer rooms.”" },
      { s: "The writer's favourite subject is English.", answer: "True", explain: "“My favourite subject is English.”" },
      { s: "Last summer, the writer was in Da Nang.", answer: "False", explain: "“Last summer, I was in Nha Trang with my family.”" },
    ],
  }),
  P({
    id: "sports-day", kinds: ["cuoi-hk1"], title: "Our sports day",
    text: `Our sports day is in October. It is a fun day at my school. On sports day, my friends and I get up early. We go to school at half past six.

My class plays tug of war and badminton. My friend Minh can run very fast. He likes PE because he wants to be a football player. Last year, our class was the winner of the tug of war.`,
    tf: [
      { s: "The sports day is in October.", answer: "True", explain: "“Our sports day is in October.”" },
      { s: "On sports day, they go to school at seven o'clock.", answer: "False", explain: "“We go to school at half past six.”" },
      { s: "Minh can run very fast.", answer: "True", explain: "“My friend Minh can run very fast.”" },
      { s: "Minh wants to be a teacher.", answer: "False", explain: "“he wants to be a football player”." },
    ],
  }),

  /* ═════════════ GIỮA HỌC KÌ II (Unit 11–15) ═════════════ */
  P({
    id: "my-family", kinds: ["giua-hk2"], title: "My family",
    text: `I live in a small house in a quiet village. My father is a farmer. He works on the farm every day. My mother is a nurse. She works in a hospital in the town.

My mother is tall and slim. She has long black hair. In the evening, I wash the dishes and my brother cleans the floor. On Sundays, we go to the cinema together.`,
    tf: [
      { s: "The family lives in a quiet village.", answer: "True", explain: "“I live in a small house in a quiet village.”" },
      { s: "The mother works on a farm.", answer: "False", explain: "“She works in a hospital in the town.”" },
      { s: "The mother has long black hair.", answer: "True", explain: "“She has long black hair.”" },
      { s: "The brother washes the dishes in the evening.", answer: "False", explain: "“I wash the dishes and my brother cleans the floor.”" },
    ],
  }),
  P({
    id: "weekend-in-the-city", kinds: ["giua-hk2"], title: "Weekends in the city",
    text: `I live in a flat on a busy street in Ha Noi. My father is a driver and my mother works in an office.

At the weekend, my family is busy too. On Saturdays, my mother goes to the supermarket and my father does yoga. On Sundays, I go to the swimming pool with my sister. In the evening, we cook dinner together. I love my family's weekends.`,
    tf: [
      { s: "The writer lives on a quiet street.", answer: "False", explain: "“I live in a flat on a busy street in Ha Noi.”" },
      { s: "The father is a driver.", answer: "True", explain: "“My father is a driver.”" },
      { s: "On Saturdays, the mother goes to the supermarket.", answer: "True", explain: "“On Saturdays, my mother goes to the supermarket.”" },
      { s: "On Sundays, the writer goes to the cinema.", answer: "False", explain: "“On Sundays, I go to the swimming pool with my sister.”" },
    ],
  }),

  /* ═════════════ CUỐI HỌC KÌ II (Unit 11–20) ═════════════ */
  P({
    id: "summer-camp", kinds: ["cuoi-hk2"], title: "At summer camp",
    text: `It is the first day of our summer camp. The weather is sunny and cool. Now the boys are putting up the tents and the girls are making a big poster.

In the evening, we are sitting around the campfire. My teacher is telling a story. My friends are singing and dancing. I am very happy because summer camp is a lot of fun.`,
    tf: [
      { s: "The weather is sunny and cool.", answer: "True", explain: "“The weather is sunny and cool.”" },
      { s: "The girls are putting up the tents.", answer: "False", explain: "“the boys are putting up the tents and the girls are making a big poster”." },
      { s: "In the evening, the teacher is telling a story.", answer: "True", explain: "“My teacher is telling a story.”" },
      { s: "The writer is not happy at the camp.", answer: "False", explain: "“I am very happy because summer camp is a lot of fun.”" },
    ],
  }),
  P({
    id: "a-trip-to-the-zoo", kinds: ["cuoi-hk2"], title: "A trip to the zoo",
    text: `Last Sunday, the weather was sunny, so my family went to the zoo. We saw lions, giraffes and monkeys. My favourite animals are monkeys because they can climb trees very fast.

After that, we went to the shopping centre. The gift shop was next to the bakery. My mother bought a T-shirt for me. It was 90,000 dong. It was a great day.`,
    tf: [
      { s: "Last Sunday, the weather was sunny.", answer: "True", explain: "“Last Sunday, the weather was sunny.”" },
      { s: "The writer's favourite animals are lions.", answer: "False", explain: "“My favourite animals are monkeys.”" },
      { s: "The gift shop was next to the bakery.", answer: "True", explain: "“The gift shop was next to the bakery.”" },
      { s: "The T-shirt was 100,000 dong.", answer: "False", explain: "“It was 90,000 dong.”" },
    ],
  }),
];

export const EN4: EnContent = {
  grade: 4,
  book: "Tiếng Anh 4 Global Success",
  units: UNITS,
  passages: PASSAGES,
  words: [50, 100],
  apart: [["nơi ở", "nơi đi vào cuối tuần"], ["nơi ở", "nơi trong thành phố"], ["nơi làm việc", "nơi trong thành phố"], ["nơi làm việc", "nơi đi vào cuối tuần"], ["nơi đi vào cuối tuần", "nơi trong thành phố"], ["nơi trong trường", "nơi đi chơi"], ["việc nhà", "hoạt động ở trại hè"]],
};
