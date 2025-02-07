const axios = require('axios');
const fs = require('fs');
const path = './data/data.json';
const logPath = './data/error.log';

// 确保 data.json、error.log 存在
if (!fs.existsSync('./data')) fs.mkdirSync('./data');
if (!fs.existsSync(path)) fs.writeFileSync(path, '[]');
if (!fs.existsSync(logPath)) fs.writeFileSync(logPath, '');

// 记录错误日志
const logError = (message) => {
  const timestamp = new Date().toISOString();
  fs.appendFileSync(logPath, `[${timestamp}] ${message}\n`);
};

// 5 个 API 接口
const fetchCalendarData = async (date) => {
  try {
    const response = await axios.get('https://api.timelessq.com/time', { params: { datetime: date } });
    return response.data;
  } catch (error) {
    logError(`Calendar API error for ${date}: ${error.message}`);
    return null;
  }
};

const fetchAstroData = async (date) => {
  try {
    const response = await axios.get('https://api.timelessq.com/time/astro', { params: { keyword: date } });
    return response.data;
  } catch (error) {
    logError(`Astro API error for ${date}: ${error.message}`);
    return null;
  }
};

const fetchShichenData = async (date) => {
  try {
    const response = await axios.get('https://api.timelessq.com/time/shichen', { params: { date } });
    return response.data;
  } catch (error) {
    logError(`Shichen API error for ${date}: ${error.message}`);
    return null;
  }
};

const fetchJieqiData = async (year) => {
  try {
    const response = await axios.get('https://api.timelessq.com/time/jieqi', { params: { year } });
    return response.data;
  } catch (error) {
    logError(`Jieqi API error for ${year}: ${error.message}`);
    return null;
  }
};

const fetchHolidaysData = async (year) => {
  try {
    const response = await axios.get(`https://api.jiejiariapi.com/v1/holidays/${year}`);
    return response.data;
  } catch (error) {
    logError(`Holidays API error for ${year}: ${error.message}`);
    return null;
  }
};

// 获取 2025-01-01 到今天的数据
const fetchData = async () => {
  try {
    console.log('Fetching data...');
    const startDate = new Date('2025-01-01');
    const today = new Date();
    const dates = [];

    for (let d = startDate; d <= today; d.setDate(d.getDate() + 1)) {
      dates.push(d.toISOString().split('T')[0]);
    }

    let existingData = [];
    try {
      const fileData = fs.readFileSync(path, 'utf8');
      if (fileData) existingData = JSON.parse(fileData);
    } catch (error) {
      logError(`Error parsing data.json: ${error.message}`);
      existingData = [];
    }

    for (const date of dates) {
      if (existingData.some(entry => entry.date === date)) {
        console.log(`Skipping ${date}, already in data.json.`);
        continue;
      }

      console.log(`Fetching data for ${date}...`);
      const [calendar, astro, shichen, jieqi, holidays] = await Promise.all([
        fetchCalendarData(date),
        fetchAstroData(date),
        fetchShichenData(date),
        fetchJieqiData(date.split('-')[0]),
        fetchHolidaysData(date.split('-')[0])
      ]);

      existingData.push({ date, calendar, astro, shichen, jieqi, holidays });
      fs.writeFileSync(path, JSON.stringify(existingData, null, 2));
      console.log(`Saved ${date} to data.json`);
    }
  } catch (error) {
    logError(`Failed to fetch data: ${error.message}`);
  }
};

fetchData();
