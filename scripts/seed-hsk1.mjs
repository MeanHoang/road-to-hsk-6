// Seed toàn bộ từ vựng và chú thích của 标准教程1, lấy từ MỤC LỤC sách (trang 8-12).
//
// Mục lục liệt kê đủ 词汇 và 注释 của cả 15 bài — đó là lý do dùng nó thay vì bóc
// từng trang bài: một nguồn, đủ 15 bài, ít sai sót hơn.
//
// `word` và `isOverSyllabus` (dấu * trong sách) là source "pdf".
// `pinyin`, `pos`, `meaningVi` là source "ai" — PHẢI soát lại với sách.
//
// Chạy: node scripts/seed-hsk1.mjs

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');

// [chữ, pinyin, từ loại, nghĩa, vượt-đại-cương?]
const VOCAB = {
  1: [['你','nǐ','đại từ','bạn, anh, chị'],['好','hǎo','tính từ','tốt, khoẻ'],['您','nín','đại từ','ngài (kính ngữ)',1],['你们','nǐmen','đại từ','các bạn'],['对不起','duìbuqǐ','động từ','xin lỗi'],['没关系','méi guānxi','cụm','không sao']],
  2: [['谢谢','xièxie','động từ','cảm ơn'],['不','bù','phó từ','không'],['不客气','bú kèqi','cụm','đừng khách sáo'],['再见','zàijiàn','động từ','tạm biệt']],
  3: [['叫','jiào','động từ','gọi, tên là'],['什么','shénme','đại từ','gì, cái gì'],['名字','míngzi','danh từ','tên'],['我','wǒ','đại từ','tôi'],['是','shì','động từ','là'],['老师','lǎoshī','danh từ','giáo viên'],['吗','ma','trợ từ','không? (hỏi)'],['学生','xuésheng','danh từ','học sinh'],['人','rén','danh từ','người'],['李月','Lǐ Yuè','tên riêng','Lý Nguyệt'],['中国','Zhōngguó','tên riêng','Trung Quốc'],['美国','Měiguó','tên riêng','Mỹ']],
  4: [['她','tā','đại từ','cô ấy'],['谁','shéi','đại từ','ai'],['的','de','trợ từ','của'],['汉语','Hànyǔ','danh từ','tiếng Hán'],['哪','nǎ','đại từ','nào'],['国','guó','danh từ','nước, quốc gia'],['呢','ne','trợ từ','thì sao? (hỏi)'],['他','tā','đại từ','anh ấy'],['同学','tóngxué','danh từ','bạn học'],['朋友','péngyou','danh từ','bạn bè']],
  5: [['家','jiā','danh từ','nhà, gia đình'],['有','yǒu','động từ','có'],['口','kǒu','lượng từ','khẩu (đếm người trong nhà)',1],['女儿','nǚ’ér','danh từ','con gái'],['几','jǐ','đại từ','mấy'],['岁','suì','lượng từ','tuổi'],['了','le','trợ từ','rồi (biến đổi)'],['今年','jīnnián','danh từ','năm nay'],['多','duō','phó từ','bao (nhiêu)'],['大','dà','tính từ','lớn']],
  6: [['会','huì','động từ năng nguyện','biết (làm gì)'],['说','shuō','động từ','nói'],['妈妈','māma','danh từ','mẹ'],['菜','cài','danh từ','món ăn, rau'],['很','hěn','phó từ','rất'],['好吃','hǎochī','tính từ','ngon',1],['做','zuò','động từ','làm, nấu'],['写','xiě','động từ','viết'],['汉字','Hànzì','danh từ','chữ Hán'],['字','zì','danh từ','chữ'],['怎么','zěnme','đại từ','thế nào, làm sao'],['读','dú','động từ','đọc']],
  7: [['请','qǐng','động từ','mời, xin'],['问','wèn','động từ','hỏi',1],['今天','jīntiān','danh từ','hôm nay'],['号','hào','danh từ','ngày (trong tháng)'],['月','yuè','danh từ','tháng'],['星期','xīngqī','danh từ','tuần, thứ'],['昨天','zuótiān','danh từ','hôm qua'],['明天','míngtiān','danh từ','ngày mai'],['去','qù','động từ','đi'],['学校','xuéxiào','danh từ','trường học'],['看','kàn','động từ','xem, đọc'],['书','shū','danh từ','sách']],
  8: [['想','xiǎng','động từ năng nguyện','muốn, nghĩ'],['喝','hē','động từ','uống'],['茶','chá','danh từ','trà'],['吃','chī','động từ','ăn'],['米饭','mǐfàn','danh từ','cơm'],['下午','xiàwǔ','danh từ','buổi chiều'],['商店','shāngdiàn','danh từ','cửa hàng'],['买','mǎi','động từ','mua'],['个','gè','lượng từ','cái, người'],['杯子','bēizi','danh từ','cái cốc'],['这','zhè','đại từ','này'],['多少','duōshao','đại từ','bao nhiêu'],['钱','qián','danh từ','tiền'],['块','kuài','lượng từ','đồng (tiền)'],['那','nà','đại từ','kia, đó']],
  9: [['小','xiǎo','tính từ','nhỏ'],['猫','māo','danh từ','con mèo'],['在','zài','động từ','ở (tại)'],['那儿','nàr','đại từ','ở kia'],['狗','gǒu','danh từ','con chó'],['椅子','yǐzi','danh từ','cái ghế'],['下面','xiàmiàn','danh từ','phía dưới'],['在','zài','giới từ','ở, tại'],['哪儿','nǎr','đại từ','ở đâu'],['工作','gōngzuò','động từ','làm việc'],['儿子','érzi','danh từ','con trai'],['医院','yīyuàn','danh từ','bệnh viện'],['医生','yīshēng','danh từ','bác sĩ'],['爸爸','bàba','danh từ','bố']],
  10:[['桌子','zhuōzi','danh từ','cái bàn'],['上','shàng','danh từ','trên'],['电脑','diànnǎo','danh từ','máy tính'],['和','hé','liên từ','và'],['本','běn','lượng từ','quyển'],['里','lǐ','danh từ','trong'],['前面','qiánmiàn','danh từ','phía trước'],['后面','hòumiàn','danh từ','phía sau'],['这儿','zhèr','đại từ','ở đây'],['没有','méiyǒu','động từ','không có'],['能','néng','động từ năng nguyện','có thể'],['坐','zuò','động từ','ngồi'],['王方','Wáng Fāng','tên riêng','Vương Phương'],['谢朋','Xiè Péng','tên riêng','Tạ Bằng']],
  11:[['现在','xiànzài','danh từ','bây giờ'],['点','diǎn','lượng từ','giờ'],['分','fēn','lượng từ','phút'],['中午','zhōngwǔ','danh từ','buổi trưa'],['吃饭','chīfàn','động từ','ăn cơm'],['时候','shíhou','danh từ','lúc, khi'],['回','huí','động từ','về, trở lại'],['我们','wǒmen','đại từ','chúng tôi'],['电影','diànyǐng','danh từ','phim'],['住','zhù','động từ','ở, sống'],['前','qián','danh từ','trước'],['北京','Běijīng','tên riêng','Bắc Kinh']],
  12:[['天气','tiānqì','danh từ','thời tiết'],['怎么样','zěnmeyàng','đại từ','thế nào'],['太','tài','phó từ','quá'],['热','rè','tính từ','nóng'],['冷','lěng','tính từ','lạnh'],['下雨','xiàyǔ','động từ','mưa'],['小姐','xiǎojiě','danh từ','cô, tiểu thư'],['来','lái','động từ','đến'],['身体','shēntǐ','danh từ','sức khoẻ, cơ thể',1],['爱','ài','động từ','yêu, thích'],['些','xiē','lượng từ','một ít'],['水果','shuǐguǒ','danh từ','hoa quả'],['水','shuǐ','danh từ','nước']],
  13:[['喂','wèi','thán từ','a lô'],['也','yě','phó từ','cũng',1],['学习','xuéxí','động từ','học tập'],['上午','shàngwǔ','danh từ','buổi sáng'],['睡觉','shuìjiào','động từ','ngủ'],['电视','diànshì','danh từ','tivi'],['喜欢','xǐhuan','động từ','thích'],['给','gěi','giới từ','cho, gọi cho',1],['打电话','dǎ diànhuà','cụm động từ','gọi điện thoại'],['吧','ba','trợ từ','nhé, đi',1],['大卫','Dàwèi','tên riêng','David']],
  14:[['东西','dōngxi','danh từ','đồ vật'],['一点儿','yìdiǎnr','lượng từ','một chút'],['苹果','píngguǒ','danh từ','quả táo'],['看见','kànjiàn','động từ','nhìn thấy'],['先生','xiānsheng','danh từ','ông, ngài'],['开','kāi','động từ','lái, mở'],['车','chē','danh từ','xe'],['回来','huílái','động từ','trở về'],['分钟','fēnzhōng','danh từ','phút'],['后','hòu','danh từ','sau'],['衣服','yīfu','danh từ','quần áo'],['漂亮','piàoliang','tính từ','đẹp'],['啊','a','trợ từ','a, à',1],['少','shǎo','tính từ','ít'],['这些','zhèxiē','đại từ','những cái này'],['都','dōu','phó từ','đều'],['张','Zhāng','tên riêng','Trương']],
  15:[['认识','rènshi','động từ','quen biết'],['年','nián','danh từ','năm'],['大学','dàxué','danh từ','đại học'],['饭店','fàndiàn','danh từ','khách sạn, nhà hàng'],['出租车','chūzūchē','danh từ','taxi'],['一起','yìqǐ','phó từ','cùng nhau',1],['高兴','gāoxìng','tính từ','vui'],['听','tīng','động từ','nghe'],['飞机','fēijī','danh từ','máy bay']],
};

// [tiêu đề Hán, tiêu đề Việt, công thức]
const NOTES = {
  3: [['疑问代词“什么”','Đại từ nghi vấn 什么','S + 叫 + 什么 + N?'],['“是”字句','Câu có từ 是','A + 是 + B'],['用“吗”的疑问句','Câu hỏi có từ 吗','Câu trần thuật + 吗?']],
  4: [['疑问代词“谁”、“哪”','Đại từ nghi vấn 谁 và 哪','… 是 + 谁? / 哪 + 国 + 人?'],['结构助词“的”','Trợ từ kết cấu 的','A + 的 + B'],['疑问助词“呢”(1)','Trợ từ nghi vấn 呢 (1)','N + 呢?']],
  5: [['疑问代词“几”','Đại từ nghi vấn 几','几 + lượng từ + N?'],['百以内的数字','Các số dưới 100',null],['“了”表变化','Trợ từ chỉ sự thay đổi 了','… + 了'],['“多+大”表示疑问','Câu hỏi dùng 多 + 大','N + 多大?']],
  6: [['能愿动词“会”(1)','Động từ năng nguyện 会 (1)','S + 会 + V'],['形容词谓语句','Câu có vị ngữ là tính từ','S + (很) + Adj'],['疑问代词“怎么”(1)','Đại từ nghi vấn 怎么 (1)','怎么 + V?']],
  7: [['日期的表达(1)：月、日/号、星期','Cách diễn tả ngày tháng (1): tháng, ngày, thứ',null],['名词谓语句','Câu có vị ngữ là danh từ','S + N (thời gian/tuổi/giá)'],['连动句(1)','Câu liên động từ (1)','去 + nơi chốn + làm gì']],
  8: [['能愿动词“想”','Động từ năng nguyện 想','S + 想 + V'],['疑问代词“多少”','Đại từ nghi vấn 多少','多少 + (lượng từ) + N?'],['量词“个”、“口”','Lượng từ 个 và 口','số + 个/口 + N'],['钱数的表达','Cách diễn đạt số tiền','số + 块 (+ 钱)']],
  9: [['动词“在”','Động từ 在','S + 在 + nơi chốn'],['疑问代词“哪儿”','Đại từ nghi vấn 哪儿','S + 在 + 哪儿?'],['介词“在”','Giới từ 在','S + 在 + nơi chốn + V'],['疑问助词“呢”(2)','Trợ từ nghi vấn 呢 (2)','S + 呢?']],
  10:[['“有”字句：表示存在','Câu có từ 有: diễn tả sự tồn tại','nơi chốn + 有 + N'],['连词“和”','Liên từ 和','A + 和 + B'],['能愿动词“能”','Động từ năng nguyện 能','S + 能 + V'],['用“请”的祈使句','Câu cầu khiến với 请','请 + V']],
  11:[['时间的表达','Cách diễn tả thời gian','số + 点 + số + 分'],['时间词做状语','Từ chỉ thời gian làm trạng ngữ','S + thời gian + V'],['名词“前”','Danh từ 前',null]],
  12:[['疑问代词“怎么样”','Đại từ nghi vấn 怎么样','S + 怎么样?'],['主谓谓语句','Câu có vị ngữ là kết cấu chủ-vị','S1 + (S2 + V)'],['程度副词“太”','Phó từ chỉ mức độ 太','太 + Adj + 了'],['能愿动词“会”(2)','Động từ năng nguyện 会 (2)','S + 会 + V (khả năng xảy ra)']],
  13:[['叹词“喂”','Từ cảm thán 喂',null],['“在……呢”表示动作正在进行','在…呢 diễn tả hành động đang diễn ra','S + 在 + V + 呢'],['电话号码的表达','Cách đọc số điện thoại',null],['语气助词“吧”','Trợ từ ngữ khí 吧','… + 吧']],
  14:[['“了”表发生或完成','了 diễn tả việc đã xảy ra hay hoàn thành','S + V + 了 + O'],['名词“后”','Danh từ 后',null],['语气助词“啊”','Trợ từ ngữ khí 啊','… + 啊'],['副词“都”','Phó từ 都','S + 都 + V']],
  15:[['“是……的”句','Câu có cấu trúc 是…的: nhấn mạnh thời gian, địa điểm, cách thức','S + 是 + … + V + 的'],['日期的表达(2)','Cách diễn tả ngày tháng (2): năm, tháng, ngày, thứ',null]],
};

const envelope = (collection, lesson, title, items) => ({
  collection, lesson, title, schemaVersion: 1, items,
});

let words = 0;
let points = 0;

for (let no = 1; no <= 15; no += 1) {
  const pad = String(no).padStart(2, '0');
  const slug = `hsk1-l${pad}`;
  const dir = path.join(ROOT, `content/hsk1/lesson-${pad}`);

  const vocab = (VOCAB[no] || []).map(([word, pinyin, pos, meaningVi, over], i) => ({
    id: `h1l${pad}-v${String(i + 1).padStart(2, '0')}`,
    no: i + 1,
    word,
    pinyin,
    pos,
    meaningVi,
    isOverSyllabus: !!over,
    image: null,
    source: { word: 'pdf', isOverSyllabus: 'pdf', pinyin: 'ai', pos: 'ai', meaningVi: 'ai' },
  }));
  if (vocab.length) {
    fs.writeFileSync(
      path.join(dir, 'vocabulary.json'),
      `${JSON.stringify(envelope('vocabulary', slug, 'Từ vựng', vocab), null, 2)}\n`,
    );
    words += vocab.length;
  }

  const notes = (NOTES[no] || []).map(([titleZh, titleVi, pattern], i) => ({
    id: `h1l${pad}-n${i + 1}`,
    no: i + 1,
    titleZh,
    titleVi,
    pattern,
    examples: [],
    source: { titleZh: 'pdf', titleVi: 'ai', pattern: 'ai' },
  }));
  if (notes.length) {
    fs.writeFileSync(
      path.join(dir, 'notes.json'),
      `${JSON.stringify(envelope('notes', slug, 'Chú thích', notes), null, 2)}\n`,
    );
    points += notes.length;
  }
}

console.log(`✓ ${words} từ vựng · ${points} điểm ngữ pháp trên 15 bài`);
