// Toàn bộ chữ của AI Lành Nghề. View không chứa chữ cứng. <b> dùng để in đậm (render bằng set:html).

export const site = {
  name: "AI Lành Nghề",
  tagline: "AI giỏi việc. Bạn vững nghề.",
  definition:
    "AI Lành Nghề là ứng dụng web làm việc theo nghề. Người lao động chọn đúng việc cần làm, điền vài thông tin, tải file lên; app dùng <b>AI của chính doanh nghiệp/người dùng</b> (kết nối một lần) để làm theo quy trình nghề do chuyên gia đóng gói, trả kết quả theo mẫu kèm checklist tự kiểm, và đo được thời gian tiết kiệm.",
  oldSite: "https://annguyen30112301.github.io/ai-lanh-nghe/"
};

export const ui = {
  skip: "Bỏ qua, tới nội dung chính",
  nav: { home: "Trang chủ", how: "Cách hoạt động", packs: "Gói nghề", pricing: "Bảng giá", safety: "An toàn" },
  tabs: { home: "Trang chủ", how: "Cách làm", packs: "Gói nghề", pricing: "Bảng giá", more: "Thêm" },
  login: "Đăng nhập",
  order: "Đặt mua",
  cta: "Dùng thử miễn phí",
  ctaShort: "Dùng thử",
  more: "Thêm",
  footer: {
    tagline: "AI giỏi việc. Bạn vững nghề.",
    explore: "Khám phá",
    contact: "Liên hệ",
    city: "TP. Hồ Chí Minh",
    demo: "Website demo cho đồ án môn Thương mại điện tử – UEH, Nhóm 02. Không phát sinh giao dịch thật; dữ liệu và doanh nghiệp trong ví dụ đều là giả lập.",
    oldSite: "Website giới thiệu bản cũ",
    email: "hello@ailanhnghe.vn",
    legal: "Thông tin",
    terms: "Điều khoản dịch vụ",
    privacy: "Chính sách dữ liệu",
    qa: "Hỏi đáp",
    images: "Ảnh màn hình là app thật. Ảnh minh họa do AI tạo (nếu có) được ghi chú ngay dưới ảnh."
  }
};

export const home = {
  title: "AI Lành Nghề – làm việc nghề nhanh hơn với AI của chính bạn",
  description: "Chọn đúng việc, tải file, nhận kết quả theo mẫu kèm checklist. Dữ liệu nhạy cảm được che trước khi gửi lên AI.",
  hero: {
    day: "Ví dụ minh họa · Sáng thứ Hai của chị Lan",
    headline: "3 báo giá. Sếp cần đề xuất trước 10 giờ.",
    headlineDone: "Xong lúc 08:18. Chị vẫn là người quyết định.",
    lead: "Chị Lan làm mua hàng 22 năm. Sáng nay có ba nhà cung cấp gửi báo giá ba kiểu khác nhau. Kéo xuống để xem chị làm xong trước giờ họp như thế nào.",
    cta: { label: "Dùng thử với báo giá của bạn", href: "/app/dang-nhap/" },
    cta2: { label: "Xem cách hoạt động", href: "/cach-hoat-dong/" },
    files: ["Bao_gia_Minh_Long_Phat.xlsx", "Bao_gia_Sao_Phuong_Nam.xlsx", "Bao_gia_Dai_Thanh.pdf"],
    beats: [
      { t: "08:00", title: "Ba báo giá vừa tới", body: "Một file Excel kiểu này, một file kiểu khác, một bản PDF." },
      { t: "08:03", title: "Chọn “So sánh báo giá”", body: "Gõ mặt hàng, chọn ưu tiên “Cân bằng”, kéo ba file vào." },
      { t: "08:05", title: "Tên thật được che trước khi gửi", body: "Tên nhà cung cấp, số điện thoại, mã số thuế đổi thành nhãn." },
      { t: "08:09", title: "Bảng so sánh trả về", body: "Cùng tiêu chí, cùng đơn vị, có đề xuất và lý do. Tên thật hiện lại." },
      { t: "08:15", title: "Tự kiểm theo checklist", body: "Sáu dòng kiểm: VAT, đơn vị tính, hiệu lực báo giá…" },
      { t: "08:18", title: "Xuất Excel, gửi trưởng phòng", body: "Còn 42 phút trước giờ họp giao ban." }
    ],
    masked: [
      { o: "Thép Minh Long Phát", l: "[NCC_1]" },
      { o: "0903 123 456", l: "[SDT_1]" },
      { o: "Sao Phương Nam", l: "[NCC_2]" },
      { o: "MST 0312345678", l: "[MST_1]" },
      { o: "Đại Thành", l: "[NCC_3]" }
    ],
    table: {
      head: ["Tiêu chí", "Minh Long Phát", "Sao Phương Nam", "Đại Thành"],
      rows: [
        ["Đơn giá (đ/tấn)", "18.500.000", "18.150.000", "18.900.000"],
        ["Thời gian giao", "14 ngày", "10 ngày", "7 ngày"],
        ["Thanh toán", "50% trước", "30 ngày", "100% khi giao"]
      ],
      pick: "Đề xuất: Sao Phương Nam – giá thấp nhất, thanh toán 30 ngày.",
      pickMasked: "Đề xuất: [NCC_2] – giá thấp nhất, thanh toán 30 ngày."
    },
    checklist: ["Đơn vị tính đã giống nhau", "Giá đã cùng điều kiện VAT", "Đã kiểm tra hiệu lực báo giá"],
    exported: "Đã xuất So_sanh_bao_gia.xlsx",
    exportLabel: "Xuất Excel",
    formLine: "Thép tấm SS400 · Ưu tiên: Cân bằng",
    masking: "Đang che dữ liệu…",
    maskedCount: "Đã che {n} thông tin",
    sending: "Đang gửi lên AI của công ty bạn"
  },
  definitionTitle: "AI Lành Nghề là gì?",
  why: {
    title: "Vì sao người làm nghề lâu năm cần làm ngay",
    lead: "Thị trường lao động văn phòng đang thay đổi nhanh hơn tốc độ học lại từ đầu.",
    stats: [
      { value: 19, suffix: "%", label: "số người bị cho nghỉ việc năm 2025 là lao động trên 40 tuổi" },
      { value: 58, suffix: "%", label: "trong số đó cần khoảng 12 tháng mới tìm được việc mới" }
    ],
    source: "Nguồn: TopCV (2026), theo VnExpress, 01/2026.",
    sourceLink: { label: "Lao động trên 40 tuổi bị cắt giảm việc nhiều nhất năm 2025", href: "https://vnexpress.net/lao-dong-tren-40-tuoi-bi-cat-giam-viec-nhieu-nhat-nam-2025-5002504.html" }
  },
  compare: {
    title: "Tự dùng ChatGPT khác gì AI Lành Nghề?",
    lead: "Cùng một mô hình AI, kết quả khác nhau ở cách giao việc.",
    left: "Tự dùng ChatGPT",
    right: "AI Lành Nghề",
    rows: [
      ["Mỗi lần phải tự viết câu lệnh, kết quả lúc hay lúc dở", "Chọn đúng việc, điền vài ô – quy trình nghề đã được chuyên gia đóng gói"],
      ["Dễ dán nguyên báo giá có tên, số điện thoại, mã số thuế", "Thông tin nhạy cảm được che thành nhãn trước khi gửi, bạn xem trước từng chữ"],
      ["Câu trả lời dạng đoạn văn, phải tự kẻ lại bảng", "Kết quả theo mẫu: bảng so sánh, thư, tóm tắt – xuất Excel/Word ngay"],
      ["Không biết AI có bịa số hay không", "Checklist tự kiểm bắt buộc trước khi xuất file"],
      ["Không ai biết tiết kiệm được bao nhiêu thời gian", "Đo được phút tiết kiệm cho từng người, từng việc"],
      ["Mỗi người một tài khoản, công ty không kiểm soát", "Doanh nghiệp gắn key công ty một lần, quản lý seat tập trung"]
    ]
  },
  numbers: {
    title: "Một lượt so sánh báo giá",
    note: "Số phút là ước tính của nhóm và ví dụ minh họa, không phải số đo trên người dùng thật. Trong app, mỗi người sửa được số phút làm tay của mình để tính tiết kiệm.",
    items: [
      { value: 45, suffix: " phút", label: "thường mất khi làm tay (ước tính của nhóm)" },
      { value: 18, suffix: " phút", label: "trong ví dụ minh họa của chị Lan, gồm cả tự kiểm" },
      { value: 0, suffix: " file", label: "được lưu trên máy chủ của chúng tôi" }
    ]
  },
  steps: {
    title: "Ba việc bạn làm, phần còn lại AI lo",
    items: [
      { icon: "list", title: "Chọn đúng việc", body: "So sánh báo giá, soạn thư thương lượng, tóm tắt hồ sơ nhà cung cấp." },
      { icon: "upload", title: "Điền vài ô, tải file", body: "Excel hoặc PDF có chữ. Đánh dấu tên cần che, xem trước dữ liệu gửi lên AI." },
      { icon: "checks", title: "Kiểm rồi xuất", body: "Tick checklist, xuất Excel hoặc Word đúng mẫu để gửi đi." }
    ],
    more: "Xem chi tiết cách hoạt động"
  },
  packs: {
    title: "Bắt đầu từ nghề Mua hàng",
    lead: "Ba tình huống đầu tiên đã chạy được. Giảng dạy và Hành chính – Nhân sự sắp ra mắt.",
    more: "Xem gói nghề"
  },
  final: {
    title: "Thử với báo giá thật của bạn – 5 lượt miễn phí",
    lead: "Không cần thẻ, không cần key AI cho lượt thử. Đăng nhập bằng email, mã gửi ngay vào hộp thư.",
    cta: "Bắt đầu dùng thử",
    cta2: "Xem bảng giá"
  }
};

export const how = {
  title: "Cách hoạt động",
  description: "Từ chọn việc đến xuất file: sáu bước, dữ liệu nhạy cảm được che trước khi tới AI.",
  intro: {
    title: "Bạn làm nghề. AI làm phần lặp lại.",
    lead: "AI Lành Nghề không bắt bạn học viết câu lệnh. Mỗi tình huống là một quy trình nghề do người làm mua hàng lâu năm đóng gói sẵn."
  },
  steps: [
    { icon: "list", title: "Chọn đúng việc cần làm", body: "Danh sách tình huống theo nghề, mỗi việc ghi rõ thường mất bao lâu khi làm tay." },
    { icon: "pen", title: "Điền vài thông tin", body: "Tối đa ba bước, mỗi ô có ví dụ. Không có thuật ngữ AI." },
    { icon: "upload", title: "Tải file lên", body: "Excel hoặc PDF có chữ. File được đọc ngay trong trình duyệt, chỉ phần chữ được gửi đi – file gốc không rời máy bạn." },
    { icon: "eye", title: "Xem trước dữ liệu gửi lên AI", body: "Bạn đánh dấu tên nhà cung cấp, tên công ty, người liên hệ. Số điện thoại, email, mã số thuế, CCCD, số tài khoản được che tự động thành nhãn như <b>[NCC_1]</b>." },
    { icon: "robot", title: "AI của bạn làm theo quy trình", body: "Yêu cầu được gửi tới AI bạn đã kết nối, chạy trên mô hình bạn tự chọn. Kết quả trả về theo đúng mẫu, sau đó nhãn được đổi lại tên thật ngay trên màn hình của bạn." },
    { icon: "checks", title: "Tự kiểm, xuất file, đo thời gian", body: "Nút Xuất chỉ bật khi bạn tick đủ checklist. Thời gian mỗi lượt được ghi lại để bạn thấy mình tiết kiệm bao nhiêu." }
  ],
  connect: {
    title: "Kết nối AI một lần",
    lead: "Bạn dùng AI của chính mình nên tự chủ chi phí và dữ liệu. Bạn tự chọn mô hình trong tài khoản AI của mình. AI Lành Nghề không chọn thay và chỉ thu phí gói nghề.",
    options: [
      { icon: "plug", title: "Một chạm qua OpenRouter", body: "Đăng nhập OpenRouter, bấm đồng ý. Không cần sao chép key. Phù hợp với cá nhân." },
      { icon: "key", title: "Dán key Gemini hoặc OpenAI", body: "Tạo key ở Google AI Studio (có hạn mức miễn phí hằng ngày) hoặc dùng key OpenAI của bạn, rồi dán vào. Kết nối được nhiều AI cùng lúc." },
      { icon: "buildings", title: "Key của công ty", body: "Quản trị viên gắn một lần cho cả phòng. Nhân viên không nhìn thấy key." }
    ],
    note: "Key được mã hóa AES-256-GCM trước khi lưu. Trình duyệt chỉ thấy 3 ký tự cuối, ví dụ ••••x9f."
  },
  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      ["Tôi có cần biết dùng ChatGPT không?", "Không. Bạn chỉ chọn việc, điền ô và tải file. Mọi chỉ dẫn cho AI đã được viết sẵn trong quy trình nghề."],
      ["Chi phí AI ai trả?", "Bạn hoặc công ty trả trực tiếp cho nhà cung cấp AI qua tài khoản của mình. Ước tính một lượt so sánh 3 báo giá tốn vài trăm đồng tiền AI. 5 lượt thử đầu tiên do AI Lành Nghề trả."],
      ["AI Lành Nghề có lưu báo giá của tôi không?", "Không. Máy chủ chỉ lưu số đếm (bạn mở lúc nào, xong lúc nào, che bao nhiêu thông tin) để tính thời gian tiết kiệm. Không lưu file, nội dung hay kết quả."],
      ["Nếu AI tính sai thì sao?", "Mỗi kết quả có checklist tự kiểm và AI được yêu cầu ghi “Không có trong báo giá” khi thiếu dữ liệu. Quyết định cuối cùng luôn là của bạn."],
      ["Nên chọn mô hình nào?", "Tùy ngân sách và yêu cầu chất lượng. Danh sách hiện giá mỗi lượt và mô hình nào đã qua bộ kiểm thử gói nghề để bạn so sánh. Tránh bậc miễn phí của nhà cung cấp nếu bậc đó cho phép dùng dữ liệu để huấn luyện."],
      ["File PDF scan có dùng được không?", "Chưa. Hãy dùng file Excel hoặc PDF có thể chọn chữ. Bản scan cần nhận dạng chữ, sẽ có ở phiên bản sau."]
    ]
  },
  cta: "Thử ngay với 5 lượt miễn phí",
  allQa: "Xem tất cả câu hỏi"
};

export const packs = {
  title: "Gói nghề",
  description: "Mỗi gói là bộ quy trình nghề do chuyên gia đóng gói: tình huống, mẫu kết quả, checklist và lớp che dữ liệu.",
  intro: { title: "Bạn làm nghề gì?", lead: "Mỗi gói nghề được dựng quanh những đầu việc thật của nghề đó. Bắt đầu từ Mua hàng." },
  open: "Đang mở",
  soon: "Sắp ra mắt",
  minutes: "Làm tay ~{n} phút (ước tính)",
  procurement: {
    name: "Mua hàng – Thu mua",
    lead: "Cho người làm mua hàng ở doanh nghiệp sản xuất, thương mại. Ba tình huống đầu tiên đã chạy được trong app.",
    cta: "Dùng thử gói Mua hàng",
    more: "Xem chi tiết gói Mua hàng"
  },
  includes: {
    title: "Mỗi gói nghề gồm",
    items: [
      { icon: "path", title: "Quy trình nghề đóng gói sẵn", body: "Vai trò, quy tắc, cách trình bày và giới hạn của AI cho từng việc." },
      { icon: "table", title: "Mẫu kết quả", body: "Bảng so sánh, thư, tóm tắt – đúng khung, xuất Excel/Word." },
      { icon: "checks", title: "Checklist tự kiểm", body: "Những điểm người làm nghề lâu năm luôn kiểm trước khi gửi." },
      { icon: "shield", title: "Lớp che dữ liệu", body: "Quy tắc che theo nghề: tên nhà cung cấp, mã số thuế, số tài khoản…" }
    ]
  },
  others: [
    { name: "Giảng dạy", items: ["Lập kế hoạch tiết học", "Tạo phiếu học tập", "Ra đề, ma trận và rubric"] },
    { name: "Hành chính – Nhân sự", items: ["Soạn thông báo nội bộ", "Tổng hợp hồ sơ ứng viên", "Trả lời câu hỏi chính sách"] }
  ]
};

export const pricing = {
  title: "Bảng giá",
  description: "Gói nghề trả theo năm. Bạn tự trả phí AI qua tài khoản của mình.",
  intro: { title: "Giá công khai, tính theo người dùng", lead: "AI Lành Nghề thu phí gói nghề. Phí AI bạn trả thẳng cho nhà cung cấp AI qua key hoặc tài khoản của bạn." },
  personalTitle: "Cho cá nhân",
  businessTitle: "Cho doanh nghiệp",
  perYear: "/năm",
  perSeat: "/người/năm",
  perTime: "/lần",
  plans: [
    {
      id: "trial", group: "personal", name: "Dùng thử", price: "0 đ", unit: "",
      for: "Bạn muốn xem AI có giúp được việc của mình không.",
      items: ["5 lượt dùng thử, AI do chúng tôi trả", "3 tình huống nghề Mua hàng", "Che dữ liệu, checklist, xuất file đầy đủ"],
      cta: "Bắt đầu miễn phí", href: "/app/dang-nhap/"
    },
    {
      id: "personal", group: "personal", name: "Cá nhân", price: "690.000 đ", unit: "/năm",
      for: "Bạn dùng hằng tuần với AI của riêng mình.",
      items: ["Gói nghề Mua hàng đầy đủ", "Kết nối OpenRouter hoặc key Gemini", "Bảng điều khiển cá nhân, đo phút tiết kiệm", "Cập nhật quy trình trong năm"],
      cta: "Chọn gói Cá nhân", href: "/dat-mua/?goi=personal"
    },
    {
      id: "business", group: "business", name: "Business", price: "690.000 đ", unit: "/người/năm",
      for: "Phòng mua hàng muốn cả nhóm làm cùng một chuẩn.",
      items: ["Mọi thứ trong gói Cá nhân", "Gắn key AI công ty một lần cho cả phòng", "Quản lý seat: mời, thu hồi, chuyển", "Bảng điều khiển doanh nghiệp: mức áp dụng theo người, theo tuần"],
      cta: "Đặt mua", href: "/dat-mua/?goi=business", featured: true,
      cta2: "Xem demo doanh nghiệp", href2: "/app/dang-nhap/?demo=doanh-nghiep"
    },
    {
      id: "business_plus", group: "business", name: "Business Plus", price: "990.000 đ", unit: "/người/năm",
      for: "Doanh nghiệp cần mẫu kết quả theo biểu mẫu riêng.",
      items: ["Mọi thứ trong gói Business", "Mẫu kết quả theo biểu mẫu công ty", "Hỗ trợ ưu tiên", "Báo cáo tiết kiệm thời gian hằng quý"],
      cta: "Đặt mua", href: "/dat-mua/?goi=business_plus",
      cta2: "Xem demo doanh nghiệp", href2: "/app/dang-nhap/?demo=doanh-nghiep"
    }
  ],
  addons: {
    title: "Dịch vụ thêm",
    items: [
      { name: "Tinh chỉnh 1:1", price: "800.000 đ", unit: "/lần", body: "Một buổi kèm riêng: chỉnh cách AI xử lý và mẫu kết quả theo đúng việc bạn làm." },
      { name: "Custom cho doanh nghiệp", price: "25–80 triệu đ", unit: "", body: "Đóng gói quy trình riêng của doanh nghiệp thành tình huống trong app. Báo giá theo số quy trình." }
    ]
  },
  aiFee: {
    title: "Phí AI tính thế nào?",
    body: "Bạn trả trực tiếp cho nhà cung cấp AI (OpenRouter, Google Gemini hoặc nhà cung cấp công ty đang dùng), tính theo lượng dùng. Ước tính của nhóm: một lượt so sánh 3 báo giá tốn vài trăm đồng (đang đo lại trong demo). Key Gemini có hạn mức miễn phí hằng ngày. 5 lượt dùng thử đầu tiên do AI Lành Nghề trả."
  },
  note: "Giá niêm yết bằng đồng Việt Nam, chưa gồm phí AI. Bản demo: chưa có thanh toán thật."
};

export const safety = {
  title: "An toàn & Tuân thủ",
  description: "Dữ liệu nhạy cảm được che trước khi tới AI. Máy chủ không lưu file, nội dung hay kết quả.",
  intro: {
    title: "Dữ liệu công việc được bảo vệ trước khi AI nhìn thấy",
    lead: "Ba nguyên tắc: che thông tin nhận diện trước khi gửi, không lưu nội dung trên máy chủ, và luôn có người kiểm tra trước khi dùng kết quả."
  },
  flow: {
    title: "Dữ liệu của bạn đi đâu?",
    steps: [
      "File được đọc ngay trong trình duyệt của bạn",
      "Chỉ phần chữ được gửi tới máy chủ AI Lành Nghề",
      "Tên, số điện thoại, mã số thuế… đổi thành nhãn",
      "Bản đã che được gửi tới AI bạn kết nối, đúng mô hình bạn chọn",
      "Kết quả về, nhãn đổi lại tên thật",
      "Bạn tự kiểm theo checklist rồi xuất file"
    ],
    note: "Bản đồ nhãn ↔ tên thật chỉ tồn tại trong bộ nhớ trong lúc xử lý một yêu cầu, rồi bị xóa. Bạn tự chọn mô hình trong tài khoản AI của mình. AI Lành Nghề không chọn thay và không tự đổi mô hình khi bạn chưa cho phép."
  },
  data: {
    title: "Thông tin nào được che?",
    head: ["Loại dữ liệu", "Cách xử lý", "Ví dụ nhãn"],
    rows: [
      ["Tên nhà cung cấp, tên công ty, người liên hệ", "Bạn đánh dấu – che theo nhãn ổn định", "[NCC_1], [CONG_TY], [NGUOI_1]"],
      ["Số điện thoại, email", "Che tự động", "[SDT_1], [EMAIL_1]"],
      ["Mã số thuế, CCCD", "Che tự động", "[MST_1], [CCCD_1]"],
      ["Số tài khoản ngân hàng", "Che tự động khi có chữ “STK/số tài khoản”", "[STK_1]"],
      ["Đơn giá, số tiền", "Mặc định giữ nguyên để so sánh; bạn có thể bật che", "[SO_TIEN_1]"]
    ]
  },
  store: {
    title: "Máy chủ lưu gì và không lưu gì",
    yes: { title: "Có lưu", items: ["Email đăng nhập", "Gói, seat, vai trò", "Số đếm mỗi lượt: mở, xong, xuất lúc nào; che bao nhiêu thông tin; lượng dùng AI; tên mô hình đã chạy", "Key AI đã mã hóa AES-256-GCM"] },
    no: { title: "Không lưu", items: ["File bạn tải lên", "Nội dung báo giá, thư, hồ sơ", "Kết quả AI trả về", "Câu lệnh gửi AI, key dạng chữ thường"] }
  },
  human: {
    title: "AI tạo kết quả. Bạn quyết định.",
    body: "Chúng tôi chịu trách nhiệm về quy trình và lớp bảo vệ, không cam kết mô hình AI bên thứ ba luôn đúng tuyệt đối. Vì vậy mỗi kết quả có checklist, và nút Xuất chỉ bật khi bạn kiểm đủ.",
    checklist: ["Số liệu đúng với tài liệu gốc", "Tên và thông tin đúng", "Không có nội dung AI tự suy diễn", "Không còn thông tin mật trong file xuất"]
  },
  law: {
    title: "Tham chiếu pháp lý",
    body: "Thiết kế theo tinh thần Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025: tối thiểu hóa dữ liệu, minh bạch mục đích xử lý, người dùng kiểm soát dữ liệu gửi đi. Gói doanh nghiệp kèm mẫu đánh giá tác động xử lý dữ liệu (DPIA)."
  },
  cta: "Xem lớp che dữ liệu hoạt động"
};

export const order = {
  title: "Đặt mua",
  description: "Đặt mua gói nghề Mua hàng: chọn gói, điền thông tin hóa đơn, thanh toán (mô phỏng) và nhận license.",
  heading: "Đặt mua gói nghề",
  lead: "Bốn bước: chọn gói, thông tin hóa đơn, thanh toán, nhận license. Giá tính lại ở máy chủ theo bảng giá công khai.",
  demoBanner: "Bản demo đồ án – không phát sinh giao dịch thật.",
  steps: ["Chọn gói", "Thông tin & hóa đơn", "Thanh toán", "Hoàn tất"],
  stepOf: "Bước {i}/{n}",
  back: "Quay lại",
  next: "Tiếp tục",
  plans: {
    personal: { name: "Cá nhân", price: "690.000 đ/năm", for: "Một người dùng, AI của riêng bạn." },
    business: { name: "Business", price: "690.000 đ/người/năm", for: "Cả phòng dùng chung một chuẩn, key AI công ty." },
    business_plus: { name: "Business Plus", price: "990.000 đ/người/năm", for: "Thêm mẫu kết quả theo biểu mẫu công ty, hỗ trợ ưu tiên." }
  },
  pack: "Gói nghề: <b>Mua hàng</b> (nghề đang mở bán). Giảng dạy, Hành chính – Nhân sự sắp ra mắt.",
  seats: "Số người dùng (seat)",
  seatsHint: "Tối thiểu 1. Ưu đãi quy mô tính theo tổng seat.",
  minus: "Bớt 1 seat",
  plus: "Thêm 1 seat",
  tinhChinh: "Thêm Tinh chỉnh 1:1 (800.000 đ/lần)",
  tinhChinhHint: "Một buổi kèm riêng, trả một lần, không thu lại khi gia hạn.",
  tinhChinhDN: "Nhận báo giá Tinh chỉnh cho doanh nghiệp",
  tinhChinhDNHint: "Liên hệ báo giá – không cộng vào đơn này. Nhóm gửi báo giá qua email nhận hóa đơn.",
  custom: "Cần đóng gói quy trình riêng (Custom 25–80 triệu đ)? Ghi chú trong bước 2, nhóm gửi báo giá riêng.",
  bill: {
    title: "Hóa đơn tạm tính",
    pack: "Gói nghề Mua hàng · {plan}",
    tinhChinh: "Tinh chỉnh 1:1 (một lần)",
    tinhChinhDN: "Tinh chỉnh doanh nghiệp",
    quote: "Liên hệ báo giá",
    listed: "Giá niêm yết",
    discount: "Ưu đãi",
    total: "Tổng thanh toán",
    period: "Hiệu lực {from} – {to}",
    renew: "Gia hạn năm sau dự kiến: {v}",
    tax: "Thuế GTGT: bản demo chưa tính (chờ kế toán chốt).",
    how: "Xem cách tính",
    tiers: "Bậc ưu đãi quy mô",
    tierRow: "{range} seat",
    tierFrom: "từ {n}",
    current: "đang áp"
  },
  info: {
    title: "Thông tin người mua",
    name: "Họ tên", namePh: "Nguyễn Thị Lan",
    email: "Email", emailPh: "lan.nguyen@congty.vn", emailHint: "License và hướng dẫn đăng nhập gửi tới email này.",
    phone: "Số điện thoại", phonePh: "0903 123 456",
    company: "Tên công ty", companyPh: "Công ty TNHH Cơ khí Tân Phú",
    tax: "Mã số thuế", taxPh: "0312345678", taxHint: "10 số, hoặc 10 số kèm 3 số chi nhánh (0312345678-001).",
    address: "Địa chỉ xuất hóa đơn", addressPh: "12 Nguyễn Văn Bảo, P.4, Gò Vấp, TP.HCM",
    invoiceEmail: "Email nhận hóa đơn điện tử", invoiceEmailPh: "ketoan@congty.vn",
    note: "Ghi chú (không bắt buộc)", notePh: "Ví dụ: cần báo giá Custom cho quy trình duyệt nhà cung cấp",
    errors: {
      name: "Bạn nhập họ tên.",
      email: "Email chưa đúng dạng, ví dụ lan.nguyen@congty.vn.",
      phone: "Số điện thoại cần 10–11 chữ số.",
      company: "Bạn nhập tên công ty.",
      tax: "Mã số thuế gồm 10 số hoặc 10 số kèm 3 số chi nhánh (0312345678-001).",
      address: "Bạn nhập địa chỉ xuất hóa đơn.",
      invoiceEmail: "Email nhận hóa đơn chưa đúng dạng."
    }
  },
  pay: {
    title: "Chọn cách thanh toán",
    methods: { bank: "Chuyển khoản", vnpay: "VNPay", momo: "MoMo" },
    bankLead: "Quét mã hoặc chuyển khoản theo thông tin dưới đây. Ghi đúng nội dung để đơn được đối soát.",
    bankName: "Ngân hàng", bankNameV: "Ngân hàng mẫu (demo)",
    account: "Số tài khoản", accountV: "0000 0000 0000",
    holder: "Chủ tài khoản", holderV: "AI LANH NGHE (DEMO)",
    amount: "Số tiền",
    content: "Nội dung chuyển khoản",
    qr: "Mã QR minh họa – không quét được",
    walletLead: "Bản thật sẽ chuyển sang cổng {m} để xác nhận. Bản demo dừng ở đây.",
    confirm: "Tôi đã thanh toán (mô phỏng)",
    confirming: "Đang ghi đơn…",
    orderCode: "Mã đơn"
  },
  done: {
    title: "Đặt mua thành công",
    lead: "License đã cấp cho <b>{email}</b>. Đây là đơn mô phỏng, không có giao dịch thật.",
    code: "Mã đơn",
    plan: "Gói",
    seats: "{n} seat",
    period: "Hiệu lực",
    total: "Đã thanh toán (mô phỏng)",
    license: "License đã cấp",
    next: "Bước tiếp theo: đăng nhập bằng email trên, kết nối AI của bạn rồi chọn mô hình.",
    cta: "Vào app và kết nối AI",
    print: "In hoặc lưu PDF"
  },
  errors: {
    server: "Chưa ghi được đơn. Bạn thử lại sau ít phút."
  }
};

export const trial = {
  title: "Dùng thử",
  description: "Bàn thử việc: giao cho AI một việc mẫu của nghề, xem dữ liệu được che, tự bắt lỗi bằng checklist. Không cần đăng nhập.",
  heading: "Giao cho AI một việc thật của nghề bạn",
  lead: "Chọn một việc bạn làm hằng tuần, xem dữ liệu được che trước khi gửi, rồi tự kiểm tra bản nháp bằng checklist của gói nghề.",
  chip: "Bàn thử việc",
  mock: "Kết quả soạn sẵn để minh họa, không gọi AI.",
  noLogin: "Không cần tài khoản · không lưu dữ liệu",
  steps: ["Chọn việc", "Đầu vào", "Kiểm tra", "Kết quả"],
  choose: {
    title: "Hôm nay bạn muốn giao cho AI việc gì?",
    lead: "Chọn nghề và một việc quen thuộc. Tài liệu mẫu đã điền sẵn, bạn không cần nhập dữ liệu thật.",
    preview: "Xem trước – sắp ra mắt",
    guard: "Có bước che dữ liệu",
    promise: ["Xong trong khoảng 2 phút", "Bạn kiểm tra trước khi dùng", "Không cần tài khoản"],
    start: "Bắt đầu: {x}"
  },
  bench: {
    back: "Chọn việc khác",
    input: "Bạn đưa vào",
    sample: "Dữ liệu mẫu",
    ask: "Bạn yêu cầu",
    note: "Ghi chú của bạn",
    noteClean: "Ghi chú đã ẩn danh",
    output: "AI Lành Nghề xử lý",
    draftBadge: "Bản mẫu",
    run: "Giao cho AI",
    rerun: "Giao lại cho AI",
    running: "AI đang xử lý…",
    idle: "Bấm <b>Giao cho AI</b>: dữ liệu được che trước, rồi AI làm theo quy trình nghề.",
    guardTitle: "AI dừng lại trước khi xử lý",
    before: "Trước",
    after: "Sau khi che",
    later: "Để sau",
    drafting: "Đang tạo bản nháp…",
    draft: "Bản nháp",
    draftHint: "AI tạo bản nháp. Người làm nghề kiểm tra trước khi dùng.",
    check: "Kiểm tra trước khi dùng"
  },
  mask: {
    preview: "Dữ liệu sẽ gửi lên AI",
    previewLead: "Chạy bằng đúng lớp che dữ liệu của app, ngay trong trình duyệt của bạn.",
    truncated: "…còn nữa",
    counted: "Đã che {n} thông tin"
  },
  review: {
    title: "Kiểm tra trước khi dùng",
    lead: "Đây là checklist của gói nghề. Đọc bản nháp và tick từng mục như khi bạn xem lại việc của đồng nghiệp.",
    back: "Chỉnh lại đầu vào",
    draft: "Bản nháp của AI",
    checklist: "Checklist",
    issue: "Chưa tick được mục này",
    use: "Dùng kết quả này",
    ready: "Đủ checklist. Kết quả sẵn sàng để dùng.",
    need: "Tick đủ {n} mục trước khi dùng. Mục nào chưa ổn thì bấm vào để xem gợi ý."
  },
  done: {
    title: "Xong việc: {x}",
    usual: "Việc này thường mất",
    withPack: "→ {x} với gói nghề",
    usualNote: "Ví dụ minh họa của nhóm, không phải số đo trên người dùng thật.",
    caught: "Bạn vừa bắt được 1 lỗi trước khi dùng",
    why: "Đây là lý do mỗi gói nghề đi kèm checklist: AI làm nhanh phần lặp lại, người làm nghề giữ quyền quyết định.",
    mock: "Bạn vừa xem bản mô phỏng: kết quả soạn sẵn, không có AI thật xử lý. Trong app, bạn làm việc thật với tài liệu của mình trên AI bạn kết nối.",
    next: "Bước tiếp theo",
    cta: "Làm với tài liệu thật của bạn – 5 lượt miễn phí",
    ctaLead: "Đăng nhập bằng email, không cần thẻ, không cần key AI cho lượt thử.",
    buy: "Đặt mua gói Mua hàng",
    buyLead: "690.000 đ/năm cho cá nhân, có gói cho doanh nghiệp.",
    pack: "Xem gói nghề",
    packLead: "Ba tình huống Mua hàng đang chạy trong app.",
    soon: "Giảng dạy đang sắp ra mắt",
    soonLead: "Tình huống Giảng dạy ở đây là bản xem trước. Bạn có thể thử ngay nghề Mua hàng.",
    again: "Thử thêm",
    otherJob: "Việc của nghề {x}"
  }
};

export const qa = {
  title: "Hỏi đáp",
  description: "Câu hỏi thường gặp về AI Lành Nghề: sản phẩm, chi phí, dữ liệu, cách lấy key AI và checklist trước khi nhập dữ liệu.",
  heading: "Bạn hỏi, chúng tôi trả lời thẳng",
  lead: "Những câu hỏi chúng tôi nhận được nhiều nhất, viết lại theo lời người hỏi.",
  chip: "Hỏi đáp",
  jump: "Đi tới",
  groups: [
    {
      id: "san-pham", title: "Sản phẩm",
      items: [
        ["Sao không dùng ChatGPT luôn cho xong?", "App dùng chính các mô hình AI đó qua key của bạn. Thứ được thêm vào: quy trình nghề Mua hàng đóng gói sẵn (chọn việc, điền ô, không viết câu lệnh), kết quả theo mẫu cố định kèm checklist tự kiểm, che thông tin nhạy cảm trước khi gửi, và đo thời gian tiết kiệm. Tự dùng AI dễ tin vào cảm giác: nghiên cứu của METR (2025) trên lập trình viên giàu kinh nghiệm ghi nhận họ làm chậm hơn 19% khi dùng AI nhưng lại tin rằng mình nhanh hơn 20%."],
        ["Đây là khóa học hay phần mềm?", "Phần mềm làm việc. Không bán giờ học, không cấp chứng chỉ. Bạn dùng app để làm việc thật hằng tuần."],
        ["Tôi có phải mở ChatGPT nữa không?", "Không. Mọi việc làm trong app; AI chạy phía sau bằng key bạn (hoặc công ty) kết nối một lần."],
        ["Ai viết nội dung nghề?", "Người có kinh nghiệm trong nghề đóng gói quy trình, mẫu kết quả và checklist. Nội dung được cập nhật 2 lần mỗi năm."],
        ["Nghề của tôi đã có chưa?", "Đang mở: Mua hàng. Sắp ra mắt: Giảng dạy, Hành chính – Nhân sự. Nghề khác: bạn đăng ký để nhóm ưu tiên. Xem <a href=\"/goi-nghe/\">Gói nghề</a>."]
      ]
    },
    {
      id: "chi-phi", title: "Chi phí",
      items: [
        ["690.000 đ/năm có đáng không?", "Bằng khoảng 3,2 giờ công của người có thâm niên (ước tính của nhóm theo lương bình quân khoảng 213.000 đ/giờ). Tiết kiệm khoảng 4 phút mỗi tuần là đủ bù. Bảng điều khiển trong app đo số phút bạn thực sự tiết kiệm."],
        ["Phí AI ai trả, bao nhiêu?", "Bạn hoặc công ty trả thẳng cho nhà cung cấp AI theo lượng dùng. Ước tính của nhóm: một lượt so sánh 3 báo giá khoảng 300–900 đ tùy mô hình. Khi chọn mô hình trong app, mỗi mô hình hiện giá ước tính mỗi lượt. 5 lượt đầu do AI Lành Nghề trả."],
        ["Nên chọn mô hình nào?", "Tùy ngân sách và yêu cầu chất lượng. Danh sách hiện giá mỗi lượt và mô hình nào đã qua bộ kiểm thử gói nghề để bạn so sánh. Tránh bậc miễn phí của nhà cung cấp nếu bậc đó cho phép dùng dữ liệu để huấn luyện. Bạn tự chọn mô hình trong tài khoản AI của mình, AI Lành Nghề không chọn thay."],
        ["Công ty có nên mua cho nhân sự lớn tuổi? Sao không mua khóa học ngắn?", "Doanh nghiệp mua theo phòng ban, ai trong phòng cũng dùng được. Khóa học giúp biết, nhưng không để lại công cụ làm việc và không đo được kết quả. Theo Accenture (2024), 94% người lao động muốn học cách làm việc với AI tạo sinh, nhưng chỉ 5% tổ chức đào tạo được cho số đông."]
      ]
    },
    {
      id: "du-lieu", title: "Dữ liệu",
      items: [
        ["Lấy key AI ở đâu?", "Doanh nghiệp: quản trị viên gắn key công ty một lần cho cả phòng. Cá nhân: bấm “Kết nối AI một chạm” (OpenRouter), dán key Gemini (hướng dẫn 3 bước <a href=\"#huong-dan\">bên dưới</a>) hoặc dán key OpenAI. Bạn kết nối được nhiều AI cùng lúc. Lưu ý: key Gemini bậc miễn phí cho phép Google dùng dữ liệu để cải thiện sản phẩm, nên không đưa tài liệu mật khi dùng bậc miễn phí."],
        ["Dữ liệu có ra nước ngoài? An toàn 100%?", "Không ai cam kết 100% một cách trung thực. App che thông tin nhận diện trước khi gửi, mã hóa key, không lưu file, nội dung hay kết quả; máy chủ chỉ lưu số đếm và mốc thời gian. Bản đã che được gửi tới nhà cung cấp AI bạn chọn, có thể đặt máy chủ ở nước ngoài. Doanh nghiệp là bên kiểm soát dữ liệu, AI Lành Nghề là bên xử lý. Xem trang <a href=\"/an-toan/\">An toàn</a>."],
        ["Chia sẻ tài khoản được không?", "Không. Mỗi tài khoản gắn với một người; đăng nhập trên thiết bị mới phải xác thực mã. Doanh nghiệp quản lý theo seat: mời, thu hồi, chuyển seat cho người khác."]
      ]
    }
  ],
  guide: {
    id: "huong-dan", title: "Hướng dẫn",
    gemini: {
      title: "Lấy key Gemini trong 3 bước",
      open: "Mở Google AI Studio",
      note: "Dán key ở mục <b>Kết nối AI</b> trong app. Bậc miễn phí có hạn mức hằng ngày và cho phép Google dùng dữ liệu để cải thiện sản phẩm."
    },
    checklist: {
      title: "Checklist trước khi nhập dữ liệu",
      lead: "Làm theo trước mỗi lượt, nhất là khi tài liệu có thông tin của đối tác.",
      items: [
        "Dùng file Excel hoặc PDF có chữ, không dùng bản scan.",
        "Bỏ bớt trang, sheet không cần cho việc này (tối đa khoảng 200 dòng mỗi file).",
        "Ở bước “Che thông tin”, đánh dấu tên nhà cung cấp, tên công ty bạn và người liên hệ.",
        "Đọc lại khung “Dữ liệu sẽ gửi lên AI”: không còn số CCCD, số tài khoản, số điện thoại cá nhân.",
        "Bật “Che cả số tiền” khi việc không cần so sánh giá.",
        "Không đưa tài liệu mà quy chế nội bộ cấm chia sẻ ra ngoài, kể cả khi đã che.",
        "Đang dùng bậc miễn phí của nhà cung cấp AI thì không đưa tài liệu mật."
      ]
    }
  },
  more: { title: "Chưa thấy câu bạn cần?", lead: "Thử ngay một tình huống mẫu, không cần đăng nhập.", cta: "Mở Bàn thử việc", cta2: "Dùng thử với tài liệu thật" }
};

const legalDemo = "Bản demo cho đồ án môn Thương mại điện tử – UEH. Không phải văn bản pháp lý có hiệu lực.";

export const terms = {
  title: "Điều khoản dịch vụ",
  description: "Điều khoản dịch vụ rút gọn của AI Lành Nghề (bản demo đồ án).",
  demo: legalDemo,
  updated: "Cập nhật 14/10/2026",
  sections: [
    { h: "1. Phạm vi dịch vụ", p: ["AI Lành Nghề là ứng dụng web làm việc theo nghề: quy trình nghề đóng gói sẵn, lớp che dữ liệu, mẫu kết quả, checklist tự kiểm và bảng điều khiển đo thời gian. AI chạy bằng tài khoản AI của chính khách hàng (key hoặc kết nối OpenRouter); AI Lành Nghề không bán và không thu phí sử dụng AI.", "Gói nghề đang bán: Mua hàng. Các nghề ghi “sắp ra mắt” chưa nằm trong phạm vi dịch vụ."] },
    { h: "2. Gói và thời hạn", p: ["Gói Cá nhân, Business và Business Plus có thời hạn 1 năm kể từ ngày kích hoạt, gia hạn theo bảng giá công khai tại thời điểm gia hạn. Doanh nghiệp mua theo số người dùng (seat).", "Lượt dùng thử (5 lượt) chỉ để trải nghiệm, có thể thay đổi hoặc dừng mà không báo trước."] },
    { h: "3. Tinh chỉnh 1:1", p: ["Tinh chỉnh là dịch vụ một lần (cá nhân 800.000 đ/lần; doanh nghiệp theo báo giá). Sau khi buổi tinh chỉnh đã diễn ra, phí này không hoàn lại và không thu lại khi gia hạn gói."] },
    { h: "4. Thay đổi giữa kỳ", p: ["Thêm seat giữa kỳ: tính theo số ngày còn lại đến ngày hết hạn chung của gói. Ưu đãi quy mô áp theo tổng seat sau khi thêm, chỉ cho phần mua thêm.", "Giảm seat, bỏ hoặc đổi nghề: áp dụng từ kỳ gia hạn sau, không hoàn tiền cho kỳ hiện tại. Đổi người dùng của một seat: miễn phí, có hiệu lực ngay."] },
    { h: "5. Trách nhiệm với kết quả AI", p: ["Kết quả do mô hình AI bên thứ ba tạo ra và có thể sai. Người dùng phải đọc, kiểm tra theo checklist và tự quyết định trước khi dùng hoặc gửi kết quả ra ngoài. AI Lành Nghề chịu trách nhiệm về quy trình, lớp che dữ liệu và phần mềm; không chịu trách nhiệm về quyết định kinh doanh dựa trên kết quả chưa được kiểm tra."] },
    { h: "6. Sử dụng hợp lệ", p: ["Mỗi tài khoản gắn với một người; không chia sẻ thông tin đăng nhập. Không dùng dịch vụ để xử lý dữ liệu mà bạn không có quyền xử lý, hoặc dữ liệu mà quy chế nội bộ của bạn cấm đưa ra ngoài."] },
    { h: "7. Chấm dứt", p: ["Khách hàng có thể ngừng gia hạn bất kỳ lúc nào; tài khoản dùng được đến hết kỳ đã thanh toán. AI Lành Nghề có thể tạm khóa tài khoản vi phạm mục 6 sau khi thông báo qua email. Khi chấm dứt, key AI đã lưu được xóa; số đếm sử dụng được xóa theo Chính sách dữ liệu."] },
    { h: "8. Liên hệ", p: ["Mọi câu hỏi về điều khoản: gửi email tới <a href=\"mailto:hello@ailanhnghe.vn\">hello@ailanhnghe.vn</a>."] }
  ]
};

export const privacy = {
  title: "Chính sách dữ liệu",
  description: "AI Lành Nghề lưu gì, không lưu gì, vai trò các bên và quyền của người dùng (bản demo đồ án).",
  demo: legalDemo,
  updated: "Cập nhật 14/10/2026",
  intro: "Chúng tôi thiết kế theo nguyên tắc tối thiểu hóa dữ liệu: che thông tin nhận diện trước khi gửi lên AI, không lưu nội dung công việc trên máy chủ.",
  kinds: {
    h: "1. Hai loại dữ liệu cần bảo vệ",
    items: [
      { t: "Dữ liệu cá nhân", b: "Họ tên, số điện thoại, email, CCCD, số tài khoản… của người liên hệ, nhân viên, đối tác. Xử lý theo Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15 và Nghị định 356/2025/NĐ-CP." },
      { t: "Bí mật kinh doanh", b: "Báo giá, hợp đồng, điều kiện thương mại của doanh nghiệp. Do quy chế nội bộ của khách hàng quy định; AI Lành Nghề cung cấp công cụ che nhưng không thay quy chế đó." }
    ]
  },
  store: { h: "2. Máy chủ lưu gì và không lưu gì" },
  roles: {
    h: "3. Vai trò các bên",
    rows: [
      ["Khách hàng (cá nhân hoặc doanh nghiệp)", "Bên kiểm soát dữ liệu", "Quyết định đưa tài liệu nào vào, chọn AI và mô hình, duyệt kết quả."],
      ["AI Lành Nghề", "Bên xử lý dữ liệu", "Đọc file trong trình duyệt, che thông tin, ghép yêu cầu, chuyển tới AI khách đã kết nối, trả kết quả. Không lưu nội dung."],
      ["Nhà cung cấp AI / OpenRouter", "Bên nhận dữ liệu đã che", "Xử lý yêu cầu theo điều khoản của chính nhà cung cấp mà khách hàng đã đồng ý khi tạo key."]
    ],
    head: ["Bên", "Vai trò", "Việc làm với dữ liệu"]
  },
  retention: {
    h: "4. Thời gian lưu",
    items: [
      "Nội dung file, yêu cầu gửi AI, kết quả: không lưu. Bản đồ nhãn ↔ tên thật chỉ tồn tại trong bộ nhớ trong lúc xử lý một yêu cầu.",
      "Số đếm mỗi lượt (mở, xong, xuất lúc nào; che bao nhiêu thông tin; lượng token; tên mô hình): lưu trong thời hạn gói và 12 tháng sau khi chấm dứt, rồi xóa.",
      "Key AI (đã mã hóa AES-256-GCM): lưu đến khi bạn gỡ kết nối hoặc chấm dứt tài khoản.",
      "Đơn đặt mua (bản demo): mã đơn, gói, số tiền, email, tên công ty và MST nếu có; không lưu họ tên, số điện thoại, số thẻ hay tài khoản ngân hàng."
    ]
  },
  rights: {
    h: "5. Quyền của người dùng",
    items: ["Biết dữ liệu nào về mình đang được lưu.", "Yêu cầu sửa, xóa dữ liệu tài khoản và số đếm sử dụng.", "Rút lại đồng ý, gỡ kết nối AI bất kỳ lúc nào.", "Khiếu nại tới cơ quan có thẩm quyền theo quy định."],
    how: "Gửi yêu cầu tới <a href=\"mailto:hello@ailanhnghe.vn\">hello@ailanhnghe.vn</a>; chúng tôi phản hồi trong thời hạn luật định."
  },
  incident: {
    h: "6. Báo cáo sự cố",
    p: "Khi phát hiện sự cố lộ lọt dữ liệu, AI Lành Nghề thông báo cho khách hàng bị ảnh hưởng và cơ quan có thẩm quyền trong vòng 72 giờ kể từ khi phát hiện, nêu rõ dữ liệu liên quan, mức độ và biện pháp khắc phục."
  },
  more: "Xem cách lớp che dữ liệu hoạt động ở trang <a href=\"/an-toan/\">An toàn</a>."
};

export const muaHang = {
  title: "Gói nghề Mua hàng",
  description: "Gói nghề Mua hàng – Thu mua: so sánh báo giá, thư thương lượng, hồ sơ nhà cung cấp. Che dữ liệu trước khi gửi lên AI, checklist trước khi xuất.",
  heading: "Để AI làm phần việc lặp lại. Bạn giữ quyết định mua hàng.",
  lead: "Quy trình nghề Mua hàng đóng gói sẵn trong app: chọn việc, điền vài ô, tải báo giá. Tên nhà cung cấp, mã số thuế, số điện thoại được che trước khi tới AI của bạn.",
  chip: "Mua hàng – Thu mua · Đang mở",
  cta: "Dùng thử với 5 lượt miễn phí",
  cta2: "Đặt mua",
  shotAlt: "Màn hình app: dữ liệu báo giá sau khi che, tên nhà cung cấp và số điện thoại đã thành nhãn",
  shotCap: "Ảnh chụp app thật với bộ báo giá mẫu: dữ liệu sẽ gửi lên AI sau khi che.",
  catalog: {
    title: "25 tình huống của nghề Mua hàng",
    lead: "Danh mục dự kiến, chia 5 nhóm việc. Ba tình huống đã chạy trong app; các tình huống còn lại được đóng gói dần và cập nhật 2 lần mỗi năm.",
    live: "Đang chạy trong app",
    soon: "Lộ trình",
    groups: [
      { name: "So sánh & đánh giá", items: [["So sánh báo giá nhà cung cấp", true], ["Tóm tắt và chấm hồ sơ năng lực nhà cung cấp", true], ["Đánh giá nhà cung cấp định kỳ theo chỉ tiêu", false], ["So sánh tổng chi phí sở hữu (giá, vận chuyển, bảo hành)", false], ["Lập tiêu chí chọn nhà cung cấp cho gói mua mới", false]] },
      { name: "Soạn thảo & đàm phán", items: [["Soạn thư thương lượng giá", true], ["Chuẩn bị nội dung buổi đàm phán", false], ["Soạn yêu cầu báo giá gửi nhiều nhà cung cấp", false], ["Soạn thư từ chối nhà cung cấp giữ quan hệ", false], ["Soạn email nhắc giao hàng trễ hạn", false]] },
      { name: "Rà soát rủi ro", items: [["Rà soát điều khoản hợp đồng mua bán", false], ["Kiểm tra hồ sơ pháp lý nhà cung cấp mới", false], ["Đối chiếu đơn hàng – hóa đơn – phiếu nhập kho", false], ["Phát hiện báo giá bất thường so với lịch sử", false], ["Đánh giá rủi ro phụ thuộc một nhà cung cấp", false]] },
      { name: "Tổng hợp định kỳ", items: [["Báo cáo mua hàng tuần cho quản lý", false], ["Tổng hợp tiến độ giao hàng theo nhà cung cấp", false], ["Báo cáo tiết kiệm chi phí theo quý", false], ["Tổng hợp công nợ phải trả nhà cung cấp", false], ["Theo dõi hợp đồng khung sắp hết hạn", false]] },
      { name: "Tra cứu nội bộ", items: [["Tra hạn mức phê duyệt mua hàng", false], ["Tra quy trình mua hàng nội bộ", false], ["Tra lịch sử giá của một mặt hàng", false], ["Tra điều khoản hợp đồng khung đang hiệu lực", false], ["Hỏi đáp quy định chứng từ thanh toán", false]] }
    ]
  },
  detail: {
    title: "Một tình huống từ đầu đến cuối: so sánh 3 báo giá",
    lead: "Ba nhà cung cấp báo giá cùng một mặt hàng nhưng trình bày khác nhau về giá, thời gian giao, điều khoản thanh toán và hậu mãi.",
    input: "Đầu vào",
    files: ["Báo giá nhà cung cấp A (Excel)", "Báo giá nhà cung cấp B (Excel)", "Báo giá nhà cung cấp C (PDF có chữ)"],
    ask: "Bạn điền: mặt hàng cần mua và ưu tiên (giá thấp nhất, giao nhanh, thanh toán linh hoạt hay cân bằng). Không viết câu lệnh.",
    steps: ["Đọc 3 file ngay trong trình duyệt", "Che tên, MST, số điện thoại", "Đưa về cùng tiêu chí, cùng đơn vị", "So sánh và chỉ ra điểm khác biệt", "Đề xuất kèm lý do và gợi ý thương lượng", "Đổi nhãn về tên thật, bạn tự kiểm rồi xuất"],
    stepsTitle: "App xử lý 6 bước",
    result: "Kết quả mẫu",
    head: ["Tiêu chí", "NCC A", "NCC B", "NCC C"],
    rows: [["Giá đã gồm VAT (đ)", "120.000.000", "118.500.000", "125.000.000"], ["Thời gian giao", "14 ngày", "10 ngày", "12 ngày"], ["Thanh toán", "30% – 70%", "50% – 50%", "30% – 70%"], ["Hậu mãi", "12 tháng", "18 tháng", "12 tháng"], ["Nhận xét", "Phù hợp", "Tốt nhất", "Cân nhắc"]],
    checklist: "Checklist trước khi xuất (nút Xuất chỉ bật khi tick đủ)",
    try: "Thử tình huống này không cần đăng nhập",
    timeline: { title: "Một buổi sáng làm việc", note: "Ví dụ minh họa, không phải số đo.", items: [["08:15", "Nhận 3 báo giá"], ["08:20", "App che dữ liệu, chuẩn hóa và so sánh"], ["08:27", "Kiểm tra điểm bất thường theo checklist"], ["08:35", "Chuẩn bị nội dung trao đổi với nhà cung cấp"], ["09:00", "Người mua hàng đưa ra quyết định"]] }
  },
  video: {
    title: "Video giới thiệu (2 phút)",
    caption: "Video giai đoạn 1 – cảnh dựng trên Gemini, theo mô hình cũ (cài gói vào trợ lý AI). Hiện gói nghề chạy trong Web App AI Lành Nghề với AI bạn kết nối.",
    download: "Tải video (MP4)"
  },
  includes: {
    title: "Gói nghề gồm gì",
    items: [
      { icon: "path", title: "Quy trình nghề trong app", body: "Mỗi tình huống là một quy trình đóng gói sẵn: vai trò, quy tắc, cách trình bày, giới hạn của AI. Bạn chỉ chọn việc và điền ô." },
      { icon: "table", title: "Mẫu kết quả", body: "Bảng so sánh, thư, tóm tắt đúng khung; xuất Excel hoặc Word để gửi đi." },
      { icon: "checks", title: "Checklist tự kiểm", body: "Những điểm người làm lâu năm luôn kiểm. Nút Xuất chỉ bật khi bạn tick đủ." },
      { icon: "shield", title: "Lớp che dữ liệu", body: "Tên nhà cung cấp, công ty, người liên hệ, MST, CCCD, số tài khoản được che trước khi gửi lên AI." },
      { icon: "clock", title: "Cập nhật và đo thời gian", body: "Nội dung cập nhật 2 lần mỗi năm. Bảng điều khiển đo số phút bạn tiết kiệm. Tinh chỉnh 1:1 khi cần." }
    ]
  },
  fit: {
    title: "Gói này dành cho ai",
    yes: { title: "Phù hợp nếu bạn", items: ["Làm Mua hàng / Thu mua ở doanh nghiệp sản xuất, thương mại", "Đã có kinh nghiệm nghiệp vụ", "Thường xuyên xử lý báo giá, bảng biểu, email nhà cung cấp", "Muốn dùng AI nhưng không muốn học viết câu lệnh"] },
    no: { title: "Chưa phù hợp nếu", items: ["Bạn đang tìm khóa học AI từ cơ bản", "Bạn muốn học lập trình AI", "Tài liệu của bạn chủ yếu là bản scan (chưa hỗ trợ nhận dạng chữ)"] }
  },
  price: {
    title: "Giá gói Mua hàng",
    items: [
      { name: "Cá nhân", price: "690.000 đ", unit: "/năm", href: "/dat-mua/?goi=personal" },
      { name: "Tinh chỉnh 1:1", price: "800.000 đ", unit: "/lần", href: "/dat-mua/?goi=personal" },
      { name: "Doanh nghiệp", price: "690.000 đ", unit: "/người/năm · giảm tới 30% theo số seat", href: "/dat-mua/?goi=business" }
    ],
    buy: "Đặt mua",
    all: "Xem bảng giá đầy đủ",
    aiFee: "Chưa gồm phí AI: bạn trả thẳng cho nhà cung cấp AI qua tài khoản của mình."
  },
  faq: {
    title: "Câu hỏi thường gặp",
    items: [
      ["Tôi cần tài khoản AI nào?", "Một trong ba cách: kết nối OpenRouter một chạm, dán key Gemini, hoặc dán key OpenAI. Doanh nghiệp: quản trị viên gắn key công ty một lần cho cả phòng. Bạn tự chọn mô hình trong tài khoản AI của mình."],
      ["Có phải cài gì vào ChatGPT hay Gemini không?", "Không. Gói nghề chạy trong Web App AI Lành Nghề. AI chạy phía sau bằng key bạn kết nối; bạn không phải mở ChatGPT hay Gemini."],
      ["Tôi có phải biết viết câu lệnh không?", "Không. Vai trò, quy trình, mẫu kết quả và giới hạn xử lý đã được đóng gói sẵn trong từng tình huống."],
      ["Dữ liệu công ty có an toàn không?", "Thông tin nhận diện được che thành nhãn trước khi gửi; bạn xem trước đúng dữ liệu AI sẽ thấy. Máy chủ không lưu file, nội dung hay kết quả."],
      ["Nếu AI trả lời sai thì sao?", "Mỗi kết quả có checklist tự kiểm; AI được yêu cầu ghi “Không có trong báo giá” khi thiếu dữ liệu. Quyền quyết định vẫn thuộc về bạn."],
      ["Gói có được cập nhật không?", "Có, 2 lần mỗi năm theo thay đổi của nghề và của các mô hình AI."]
    ],
    more: "Xem tất cả câu hỏi"
  }
};

export const business = {
  title: "Doanh nghiệp",
  description: "AI Lành Nghề cho phòng ban: mua theo vị trí công việc, đo được mức áp dụng, an toàn dữ liệu, quản lý seat; gói Custom đóng gói quy trình riêng.",
  heading: "Cả phòng làm cùng một chuẩn, đo được từng tuần",
  lead: "Mua theo phòng ban, không theo tuổi. Quản trị viên gắn key AI công ty một lần, mời người vào seat và theo dõi mức áp dụng thật.",
  chip: "Giải pháp doanh nghiệp",
  cta: "Xem demo doanh nghiệp",
  cta2: "Yêu cầu báo giá",
  why: {
    title: "Vì sao doanh nghiệp mua",
    items: [
      { icon: "users", title: "Mua theo vị trí, không theo tuổi", body: "Ai trong phòng Mua hàng cũng dùng được. Người lâu năm giữ kinh nghiệm, AI làm phần lặp lại." },
      { icon: "chart", title: "Đo được", body: "Số lượt, phút tiết kiệm, mức áp dụng theo người và theo tuần – lấy từ số đếm trong app, không phải khảo sát." },
      { icon: "shield", title: "An toàn dữ liệu", body: "Che thông tin trước khi gửi, không lưu nội dung, key công ty mã hóa. Nhân viên không nhìn thấy key." },
      { icon: "coins", title: "Chi phí khoảng 3,2 giờ công/người/năm", body: "690.000 đ/người/năm, giảm tới 30% theo số seat. Ước tính của nhóm theo lương bình quân khoảng 213.000 đ/giờ." }
    ]
  },
  dash: {
    title: "Bảng điều khiển doanh nghiệp",
    lead: "Ảnh chụp app thật với dữ liệu mẫu của “Cơ khí Tân Phú” (15 seat). Đăng nhập tài khoản demo để tự xem và thao tác.",
    alt: "Bảng điều khiển doanh nghiệp: giờ tiết kiệm, lượt hoàn thành, người dùng tích cực, seat; bảng mức áp dụng theo người và theo tuần",
    sample: "Dữ liệu mẫu",
    points: ["Mức áp dụng theo người và theo tuần", "Tình huống dùng nhiều nhất", "Lượt và chi phí AI ước tính theo mô hình", "Quản lý seat: mời, thu hồi, chuyển seat"]
  },
  seats: {
    title: "Quản lý seat ngay trong app",
    items: [["Mời", "Nhập email, người được mời đăng nhập là vào đúng seat của công ty."], ["Thu hồi", "Người nghỉ việc mất quyền dùng ngay, lịch sử số đếm vẫn giữ cho báo cáo."], ["Chuyển", "Đổi người dùng của một seat, không phát sinh phí."]]
  },
  custom: {
    title: "Gói Custom: đóng gói quy trình riêng của bạn",
    lead: "Khi doanh nghiệp có quy trình, biểu mẫu riêng cần đưa thành tình huống trong app. Báo giá 25–80 triệu đ theo số quy trình.",
    steps: [["Khảo sát", "Làm việc với phòng ban, chọn quy trình đáng đóng gói và chỉ số đo."], ["Thiết kế", "Viết quy trình, mẫu kết quả, checklist và quy tắc che dữ liệu riêng."], ["Triển khai & đào tạo", "Đưa tình huống vào app, hướng dẫn quản trị viên và nhân viên."], ["Đồng hành 3 tháng", "Theo dõi mức áp dụng, chỉnh quy trình theo phản hồi thật."]]
  },
  form: {
    title: "Yêu cầu báo giá",
    lead: "Điền vài thông tin, ứng dụng email của bạn sẽ mở thư soạn sẵn gửi nhóm. Không lưu gì trên máy chủ.",
    company: "Tên công ty", companyPh: "Công ty TNHH Cơ khí Tân Phú",
    name: "Người liên hệ", namePh: "Nguyễn Thị Lan",
    email: "Email", emailPh: "lan.nguyen@congty.vn",
    seats: "Số người dùng dự kiến", seatsPh: "15",
    need: "Bạn cần gì?", needs: ["Business / Business Plus", "Tinh chỉnh doanh nghiệp", "Gói Custom"],
    note: "Ghi chú", notePh: "Ví dụ: muốn đóng gói quy trình duyệt nhà cung cấp mới",
    send: "Mở thư yêu cầu báo giá",
    sent: "Đã mở ứng dụng email. Nếu không thấy, gửi thư tới {email}.",
    subject: "Yêu cầu báo giá AI Lành Nghề – {company}",
    errors: { company: "Bạn nhập tên công ty.", email: "Email chưa đúng dạng." }
  }
};

/* ======================= APP ======================= */
const usage = {
  cols: ["Mô hình", "Số lượt", "Token gửi đi", "Token nhận về", "Chi phí ước tính"],
  note: "Chi phí ước tính theo giá niêm yết của nhà cung cấp; “—” khi không rõ giá. Lượt dùng thử do AI Lành Nghề trả.",
  empty: "Chưa có lượt nào ghi tên mô hình."
};
export const app = {
  nav: { scenarios: "Tình huống", dashboard: "Bảng điều khiển", admin: "Quản trị", connect: "Kết nối AI", logout: "Đăng xuất", site: "Về trang giới thiệu" },
  loading: "Đang tải…",
  needLogin: "Bạn cần đăng nhập để tiếp tục.",
  login: {
    title: "Đăng nhập",
    description: "Đăng nhập AI Lành Nghề bằng email, không cần mật khẩu.",
    heading: "Đăng nhập bằng email",
    lead: "Không cần mật khẩu. Chúng tôi gửi mã 6 số tới email của bạn.",
    email: "Email công việc",
    emailPh: "lan.nguyen@congty.vn",
    send: "Gửi mã đăng nhập",
    sending: "Đang gửi…",
    codeTitle: "Nhập mã 6 số",
    codeLead: "Mã đã gửi tới <b>{email}</b>. Mã có hiệu lực 10 phút.",
    codeAria: "Chữ số thứ {i} của mã",
    verify: "Đăng nhập",
    verifying: "Đang kiểm tra…",
    resend: "Gửi lại mã",
    resendIn: "Gửi lại sau {s} giây",
    change: "Đổi email",
    demoCode: "Tài khoản demo – mã của bạn là",
    demo: {
      title: "Tài khoản demo có sẵn",
      lead: "Dữ liệu giả, mã hiện ngay trên màn hình.",
      items: [
        { email: "lan@ailanhnghe.demo", label: "Chị Lan – quản trị viên “Cơ khí Tân Phú” (15 seat)" },
        { email: "hung@ailanhnghe.demo", label: "Anh Hùng – nhân viên mua hàng Tân Phú" },
        { email: "thu1@ailanhnghe.demo", label: "Người thử mới – 5 lượt dùng thử" }
      ]
    },
    privacy: "Đăng nhập là bạn đồng ý để chúng tôi lưu email và số đếm sử dụng. Chúng tôi không lưu nội dung công việc."
  },
  device: {
    title: "Xác thực thiết bị mới",
    description: "Xác nhận thiết bị mới bằng mã SMS.",
    heading: "Xác nhận thiết bị mới",
    lead: "Bạn đang đăng nhập từ một thiết bị lạ. Chúng tôi đã gửi mã 6 số tới số điện thoại <b>{phone}</b>.",
    phone: "•••• ••• 456",
    codeAria: "Chữ số thứ {i} của mã SMS",
    device: "Chrome trên macOS · TP. Hồ Chí Minh",
    confirm: "Xác nhận thiết bị",
    notMe: "Không phải tôi – khóa phiên này",
    note: "Bản demo: màn hình minh họa, chưa gửi SMS thật. Nhập 6 số bất kỳ.",
    ok: "Đã xác nhận thiết bị. Đang chuyển tới tình huống…"
  },
  connect: {
    title: "Kết nối AI",
    description: "Kết nối AI của bạn một lần để dùng gói nghề.",
    heading: "Kết nối AI của bạn",
    lead: "Kết nối một lần. Bạn trả phí AI trực tiếp cho nhà cung cấp, chúng tôi không thu thêm.",
    status: { none: "Chưa kết nối", trial: "Còn {n} lượt dùng thử", connected: "Đã kết nối", by: { openrouter_oauth: "OpenRouter (một chạm)", gemini_key: "Key Gemini", openai_key: "Key OpenAI", company_key: "Key công ty" } },
    oneTap: "Kết nối AI một chạm (OpenRouter)",
    oneTapLead: "Đăng nhập OpenRouter rồi bấm “Authorize”. Không cần sao chép key.",
    gemini: "Dùng key Gemini miễn phí",
    geminiSteps: [
      "Mở <b>aistudio.google.com/apikey</b> và đăng nhập Google.",
      "Bấm <b>Create API key</b>, chọn một dự án bất kỳ.",
      "Sao chép key (bắt đầu bằng AIza… hoặc AQ.…) rồi dán vào ô dưới."
    ],
    geminiOpen: "Mở Google AI Studio",
    openai: "Dán key OpenAI của bạn",
    openaiSteps: [
      "Mở <b>platform.openai.com/api-keys</b> và đăng nhập tài khoản OpenAI.",
      "Bấm <b>Create new secret key</b>, đặt tên bất kỳ rồi tạo.",
      "Sao chép key (bắt đầu bằng sk-…) rồi dán vào ô dưới. Tài khoản cần có tín dụng (OpenAI không có bậc miễn phí cho API)."
    ],
    openaiOpen: "Mở trang key của OpenAI",
    keyLabel: "Dán key vào đây",
    keyPh: "AIza… hoặc AQ.…",
    save: "Kiểm tra và lưu key",
    saving: "Đang kiểm tra key…",
    company: "Gắn key công ty",
    companyLead: "Chỉ quản trị viên thấy mục này. Nhân viên dùng chung, không nhìn thấy key.",
    provider: "Nhà cung cấp",
    providers: { openrouter: "OpenRouter", gemini: "Google Gemini", openai: "OpenAI" },
    remove: "Gỡ kết nối",
    removeConfirm: "Gỡ {p}? Nếu mô hình đang dùng thuộc AI này, bạn cần chọn lại mô hình. Gỡ hết AI thì bạn dùng lượt thử (nếu còn).",
    connectedN: "Đã kết nối {n} AI",
    modelNow: "Mô hình đang dùng: {m}",
    addMore: "Kết nối thêm AI",
    addMoreLead: "Bạn có thể kết nối nhiều AI cùng lúc. Danh sách mô hình ở bước 2 gồm mô hình của mọi AI bạn đã kết nối. Gắn lại key của cùng nhà cung cấp sẽ thay key cũ.",
    connectedChip: "Đã kết nối",
    memberNote: "Kết nối AI của công ty do quản trị viên quản lý.",
    next: "Chọn tình huống",
    trialNote: "Chưa muốn kết nối? Bạn còn {n} lượt dùng thử bằng AI của chúng tôi.",
    mockNote: "Đang chạy ở máy: chưa có key AI thì kết quả là bản mô phỏng.",
    secure: "Key được mã hóa AES-256-GCM. Màn hình chỉ hiện 3 ký tự cuối.",
    errors: { quyen: "Chỉ quản trị viên mới đổi được kết nối AI của công ty.", "ket-noi": "Chưa kết nối được OpenRouter. Bạn bấm thử lại nhé.", "het-han": "Phiên kết nối đã quá 15 phút. Bạn bấm Kết nối lại." },
    saved: "Đã lưu key. Bước tiếp theo: chọn mô hình.",
    modelNone: "Chưa chọn mô hình",
    modelMemberNone: "Quản trị viên chưa chọn mô hình AI nên chưa chạy được. Bạn báo quản trị viên chọn mô hình ở mục Kết nối AI.",
    models: {
      step: "Bước 2 · Chọn mô hình",
      lead: "Bạn tự chọn mô hình trong tài khoản AI của mình. AI Lành Nghề không chọn thay và không xếp hạng hãng nào.",
      loading: "Đang lấy danh sách mô hình từ tài khoản AI của bạn…",
      search: "Tìm theo tên mô hình",
      filters: "Lọc",
      tested: "Đã kiểm thử với gói nghề",
      maxPrice: "Giá / lượt ≤ (đ)",
      minCtx: "Ngữ cảnh ≥ (nghìn token)",
      source: "Mô hình có trong các AI bạn đã kết nối: {p}",
      sourceOpenRouter: "OpenRouter cho dùng mô hình của nhiều hãng bằng cùng một key, nên phần OpenRouter có nhiều hãng.",
      allProviders: "Tất cả AI",
      via: "qua {p}",
      providerError: "{p}: {m}",
      count: "{n} mô hình, sắp theo tên A→Z",
      none: "Không có mô hình nào khớp bộ lọc.",
      more: "Xem thêm {n} mô hình",
      perRun: "≈ {p}/lượt",
      noPrice: "— (nhà cung cấp không công bố giá qua API)",
      ctx: "Ngữ cảnh {n}",
      testedChip: "Đã kiểm thử {s}",
      locked: "Không chọn được",
      current: "Đang dùng",
      fallbackTitle: "Khi mô hình quá tải",
      fallbackOff: "Báo lỗi để tôi thử lại",
      fallbackOn: "Chuyển sang mô hình dự phòng tôi chọn",
      fallbackPick: "Mô hình dự phòng",
      fallbackPh: "Chọn mô hình dự phòng",
      fallbackNote: "Chỉ chuyển một lần, khi mô hình chính báo quá tải. Lượt đó ghi đúng tên mô hình đã chạy.",
      save: "Lưu mô hình",
      saving: "Đang lưu…",
      saved: "Đã lưu mô hình. AI của bạn sẵn sàng.",
      pickFirst: "Bạn chọn một mô hình trong danh sách.",
      pickFallback: "Bạn chọn mô hình dự phòng (khác mô hình chính).",
      priceNote: "Giá ước tính cho một lượt khoảng 6.000 token gửi đi và 2.000 token nhận về, theo tỷ giá {r} đ/USD. Giá do nhà cung cấp AI thu trực tiếp từ tài khoản của bạn. AI Lành Nghề không thu phí AI.",
      freeTier: "Tránh bậc miễn phí của nhà cung cấp nếu bậc đó cho phép dùng dữ liệu để huấn luyện."
    }
  },
  scenarios: {
    title: "Chọn tình huống",
    description: "Chọn việc cần làm trong nghề Mua hàng.",
    heading: "Hôm nay bạn cần làm việc gì?",
    lead: "Nghề Mua hàng · 3 tình huống. Mỗi việc ghi thời gian làm tay ước tính của nhóm.",
    usual: "Làm tay ~{n} phút (ước tính)",
    start: "Bắt đầu",
    soon: "Sắp ra mắt",
    otherJobs: "Nghề khác",
    others: ["Giảng dạy", "Hành chính – Nhân sự", "Kế toán – Tài chính"],
    connected: "Đã kết nối AI. Bạn chọn việc để bắt đầu.",
    banner: { trial: "Bạn đang dùng thử: còn {n} lượt.", none: "Bạn đã hết lượt thử.", connect: "Kết nối AI", noModel: "Đã kết nối AI nhưng chưa chọn mô hình nên chưa chạy được.", pickModel: "Chọn mô hình" }
  },
  work: {
    title: "Làm việc",
    description: "Bàn làm việc: điền thông tin, tải file, xem trước dữ liệu gửi lên AI.",
    back: "Tình huống khác",
    steps: ["Việc cần làm", "Tài liệu", "Che thông tin"],
    stepOf: "Bước {i}/{n}",
    next: "Tiếp tục",
    prev: "Quay lại",
    example: "Ví dụ: {x}",
    choose: "Chọn một mục",
    missing: "Bạn chưa điền “{x}”.",
    drop: "Kéo file vào đây hoặc bấm để chọn",
    dropHint: "Excel (.xlsx, .xls, .csv) hoặc PDF có chữ · tối đa {max} file",
    reading: "Đang đọc file…",
    rows: "{n} dòng chữ",
    remove: "Bỏ file",
    needFiles: "Cần ít nhất {n} file.",
    noText: "File “{name}” không có lớp chữ. Hãy tải file Excel hoặc PDF có thể chọn chữ.",
    badType: "File “{name}” chưa hỗ trợ. Hãy dùng Excel hoặc PDF.",
    tooMany: "Tối đa {n} file.",
    demoData: "Chưa có file? Dùng bộ báo giá mẫu",
    demoLoaded: "Đã nạp dữ liệu mẫu (nhà cung cấp giả).",
    maskTitle: "Đánh dấu tên cần che",
    termPh: "Gõ tên rồi bấm Thêm",
    add: "Thêm",
    kinds: { ncc: "Nhà cung cấp", cong_ty: "Công ty bạn", nguoi: "Người liên hệ" },
    auto: "Tự động che: số điện thoại, email, mã số thuế, CCCD, số tài khoản.",
    maskMoney: "Che cả số tiền (khi không cần so sánh giá)",
    autoTerm: "tự thêm từ ô nhập",
    preview: "Dữ liệu sẽ gửi lên AI",
    previewLead: "Đây đúng là những gì AI nhìn thấy. Tên thật nằm lại trên máy bạn.",
    truncated: "…còn nữa, chỉ hiện phần đầu",
    counted: "Đã che {n} thông tin",
    sending: "Đang gửi lên AI của công ty bạn",
    sendingTrial: "Đang gửi lên AI (lượt dùng thử)",
    sendingMock: "Đang tạo kết quả mô phỏng",
    thinking: "AI đang làm theo quy trình nghề…",
    retry: "Chạy lại",
    edit: "Sửa thông tin",
    resultTitle: "Kết quả",
    restored: "Tên thật đã được trả lại",
    trialLeft: "Còn {n} lượt thử",
    seconds: "AI trả lời trong {s} giây",
    checklistTitle: "Tự kiểm trước khi xuất",
    checklistLead: "Tick đủ {n} mục thì nút Xuất mới bật.",
    exportXlsx: "Xuất Excel",
    exportDocx: "Xuất Word",
    exported: "Đã xuất file. Lượt này được ghi vào bảng điều khiển.",
    again: "Làm việc khác",
    toDash: "Xem bảng điều khiển",
    table: { criteria: "Tiêu chí", pick: "Đề xuất", why: "Lý do", nego: "Gợi ý thương lượng", missing: "Cần hỏi lại nhà cung cấp", note: "Ghi chú" },
    letter: { subject: "Tiêu đề", points: "Điểm đề nghị chính", authority: "Tự kiểm thẩm quyền trước khi gửi" },
    summary: { overview: "Tổng quan", score: "Chấm điểm", check: "Cần xác minh thêm", verdict: "Kết luận" },
    editHint: "Bạn có thể sửa trực tiếp nội dung trước khi xuất.",
    noAI: "Bạn đã dùng hết lượt thử.",
    noAICta: "Kết nối AI",
    noModelCta: "Chọn mô hình",
    model: {
      label: "Mô hình: {m}",
      change: "Đổi",
      pick: "Chọn mô hình",
      close: "Đóng",
      missing: "Chưa chọn mô hình AI nên chưa chạy được.",
      missingMember: "Quản trị viên chưa chọn mô hình AI nên chưa chạy được.",
      trial: "Lượt dùng thử chạy trên {m}. Khi kết nối AI của bạn, bạn tự chọn mô hình.",
      mock: "Đang chạy mô phỏng ở máy (chưa có key AI)."
    }
  },
  dash: {
    title: "Bảng điều khiển",
    description: "Số lượt, thời gian trung bình và phút tiết kiệm của bạn.",
    heading: "Bạn đã tiết kiệm bao nhiêu thời gian?",
    runs: "lượt hoàn thành",
    saved: "phút tiết kiệm ước tính",
    masked: "thông tin đã được che",
    top: "Việc dùng nhiều nhất",
    none: "Chưa có lượt nào. Chạy một tình huống để bắt đầu đo.",
    start: "Chọn tình huống",
    byScenario: "Theo tình huống",
    cols: ["Tình huống", "Số lượt", "TB mỗi lượt", "Làm tay"],
    weekly: "Số lượt 4 tuần gần nhất",
    recent: "Lượt gần đây",
    exported: "Đã xuất",
    notExported: "Chưa xuất",
    min: "{n} phút",
    baseline: { title: "Bạn thường mất bao lâu khi làm tay?", lead: "Sửa số phút cho đúng với bạn để phép tính tiết kiệm chính xác hơn.", save: "Lưu", saved: "Đã lưu" },
    security: "Bảo mật thiết bị",
    models: "Lượt theo mô hình",
    usage,
    howCalc: "Phút tiết kiệm = (thời gian làm tay của bạn − thời gian thực tế từ lúc mở tới lúc xuất), cộng dồn mọi lượt."
  },
  admin: {
    title: "Quản trị doanh nghiệp",
    description: "Mức áp dụng theo người và theo tuần, quản lý seat.",
    heading: "Phòng mua hàng đang dùng AI thế nào?",
    notAdmin: "Mục này dành cho quản trị viên tài khoản doanh nghiệp.",
    kpi: { saved: "giờ tiết kiệm trong 4 tuần", runs: "lượt hoàn thành", active: "người dùng tích cực", seats: "seat đã dùng / {n}" },
    adoption: "Mức áp dụng theo người và theo tuần",
    weeks: ["T1", "T2", "T3", "T4"],
    total: "Tổng",
    top: "Tình huống dùng nhiều",
    seats: {
      title: "Quản lý seat",
      lead: "Mời người mới, thu hồi hoặc chuyển seat. Bản demo không gửi email mời thật – người được mời chỉ cần đăng nhập bằng email đó.",
      name: "Họ tên", email: "Email", namePh: "Nguyễn Văn A", emailPh: "a.nguyen@congty.vn",
      invite: "Mời vào seat", revoke: "Thu hồi", transfer: "Chuyển seat", transferTo: "Chuyển cho",
      confirmRevoke: "Thu hồi seat của {name}? Người này sẽ không dùng được gói nghề của công ty.",
      status: { active: "Đang dùng", invited: "Đã mời" }, role: { admin: "Quản trị", member: "Thành viên" },
      runs: "{n} lượt", never: "Chưa dùng", cancel: "Hủy", done: "Đã cập nhật"
    },
    company: "Kết nối AI của công ty",
    models: "Lượt theo mô hình (4 tuần)",
    usage
  }
};
