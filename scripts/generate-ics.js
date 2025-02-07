const fs = require('fs');
const path = './data/data.json';
const icsPath = './calendar.ics';

// 确保 data.json 存在
if (!fs.existsSync(path)) {
  fs.writeFileSync(path, '[]');
}

// 读取数据并生成 ICS 文件
const generateICS = () => {
  try {
    const rawData = fs.readFileSync(path, 'utf8');
    const data = JSON.parse(rawData);
    let icsContent = 'BEGIN:VCALENDAR\nVERSION:2.0\n';

    data.forEach(({ date, holidays }) => {
      const holidayList = Array.isArray(holidays)
        ? holidays.map(holiday => `${holiday.name}`).join(', ')
        : '无假期';

      icsContent += `
BEGIN:VEVENT
SUMMARY:假期信息 - ${holidayList}
DTSTART:${date.replace(/-/g, '')}T000000
DESCRIPTION:假期详情: ${holidayList}
END:VEVENT
      `;
    });

    icsContent += '\nEND:VCALENDAR';
    fs.writeFileSync(icsPath, icsContent);
    console.log('ICS file generated successfully!');
  } catch (error) {
    console.error('Error generating ICS file:', error);
  }
};

generateICS();