const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

const emojis = {
  success: '✅',
  error: '❌',
  pending: '⏳',
  info: 'ℹ️',
  money: '💰',
  rocket: '🚀',
  star: '⭐',
  time: '⏱️',
  check: '✓',
  warning: '⚠️',
  key: '🔑',
  network: '🌐',
  change: '🔄'
};

let tokens = [];
let proxies = [];
let currentTokenIndex = 0;
let currentProxyIndex = 0;

function loadTokens() {
  try {
    const tokenPath = path.join(__dirname, 'token.txt');
    const tokenContent = fs.readFileSync(tokenPath, 'utf8');

    const tokenList = tokenContent.split('\n')
      .map(token => token.trim())
      .filter(token => token.length > 0);
    
    if (!tokenList.length) {
      throw new Error('Token file is empty');
    }
    
    console.log(`${colors.green}${emojis.key} Memuat ${colors.bright}${tokenList.length}${colors.reset}${colors.green} token berhasil dari token.txt${colors.reset}`);
    
    return tokenList;
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Gagal memeriksa token dari file:${colors.reset}`, error.message);
    console.error(`${colors.yellow}${emojis.warning} Silahkan buat 'token.txt' untuk menjalankan token perbaris${colors.reset}`);
    process.exit(1);
  }
}

function loadProxies() {
  try {
    const proxyPath = path.join(__dirname, 'proxies.txt');

    if (!fs.existsSync(proxyPath)) {
      console.log(`${colors.yellow}${emojis.warning} proxies.txt Tidak falid. Untuk menjalankan proxies.${colors.reset}`);
      return [];
    }
    
    const proxyContent = fs.readFileSync(proxyPath, 'utf8');

    const proxyList = proxyContent.split('\n')
      .map(proxy => proxy.trim())
      .filter(proxy => proxy.length > 0);
    
    if (proxyList.length > 0) {
      console.log(`${colors.green}${emojis.network} Memuat ${colors.bright}${proxyList.length}${colors.reset}${colors.green} proxy dari proxies.txt${colors.reset}`);
    } else {
      console.log(`${colors.yellow}${emojis.warning} Proxy tidak falid di proxies.txt. Untuk menjalankan proxies.${colors.reset}`);
    }
    
    return proxyList;
  } catch (error) {
    console.error(`${colors.yellow}${emojis.warning} Gagal memuat proxies:${colors.reset}`, error.message);
    console.log(`${colors.yellow}${emojis.warning} Menjalankan dengan proxies.${colors.reset}`);
    return [];
  }
}

function getNextToken() {
  const token = tokens[currentTokenIndex];
  currentTokenIndex = (currentTokenIndex + 1) % tokens.length;
  return token;
}

function getRandomProxy() {
  if (proxies.length === 0) return null;
  
  const proxy = proxies[currentProxyIndex];
  currentProxyIndex = (currentProxyIndex + 1) % proxies.length;
  return proxy;
}

function createProxyAgent(proxyString) {
  if (!proxyString) return null;

  let formattedProxy = proxyString;

  if (proxyString.includes('@') && !proxyString.startsWith('http')) {
    formattedProxy = `http://${proxyString}`;
  } 
  else if (!proxyString.includes('@') && !proxyString.startsWith('http')) {
    formattedProxy = `http://${proxyString}`;
  }
  
  try {
    return new HttpsProxyAgent(formattedProxy);
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Gagal membuat proxy dari ${proxyString}:${colors.reset}`, error.message);
    return null;
  }
}

function createAxiosInstance(token, proxyString = null) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36',
    'Accept': 'application/json, text/plain, */*',
    'Accept-Encoding': 'gzip, deflate, br, zstd',
    'Content-Type': 'application/json',
    'sec-ch-ua-platform': 'Windows',
    'authorization': `Bearer ${token}`,
    'sec-ch-ua': '"Brave";v="135", "Not-A.Brand";v="8", "Chromium";v="135"',
    'sec-ch-ua-mobile': '?0',
    'sec-gpc': '1',
    'accept-language': 'en-US,en;q=0.5',
    'origin': 'https://app.flow3.tech',
    'sec-fetch-site': 'same-site',
    'sec-fetch-mode': 'cors',
    'sec-fetch-dest': 'empty',
    'referer': 'https://app.flow3.tech/',
    'priority': 'u=1, i'
  };
  
  const axiosConfig = { headers };

  if (proxyString) {
    const proxyAgent = createProxyAgent(proxyString);
    if (proxyAgent) {
      axiosConfig.httpsAgent = proxyAgent;
      console.log(`${colors.cyan}${emojis.network} Menggunakan proxy: ${colors.bright}${proxyString}${colors.reset}`);
    }
  }
  
  return axios.create(axiosConfig);
}

function printBanner() {
  const bannerLines = [
    `${colors.white}
    ▄▀█ █ █▀█ █▀▄ █▀█ █▀█ █▀█ ∞
    █▀█ █ █▀▄ █▄▀ █▀▄ █▄█ █▀▀   
    ${colors.reset}`,
    `${colors.white}
    ┏━┓ ┏━┓         ┏━┓ ╔═╗             ╔═╗ ┏━┓__            ┏━┓
    ┃ ┃ ┃ ┃ ┏━╻━━━┓ ┃ ┃ ┏━┓ ┏━╻━━╻━━━━┓ ┏━┓ ┃ ┏━┛  ┏━━━━╮ ╭━━╹ ┃
    ┃ ┗━┛ ┃ ┃ ┏━┓ ┃ ┃ ┃ ┃ ┃ ┃ ┏━┓ ┏━┓ ┃ ┃ ┃ ┃ ┗━━┓ ┃ ┏━━┛ ┃ ━━ ┃
    ┗━━━ ━┛ ┗━┛ ┗━┛ ┗━┛ ┗━┛ ┗━┛ ┗━┛ ┗━┛ ┗━┛ ┗━━━━┛ ┗━━━━┛ ╰━━━━┛
    ${colors.reset}`,
    `${colors.cyan}${colors.reset}  ${colors.bright}${colors.white}FLOW3 AUTO TASK${colors.reset}  ${colors.cyan}${colors.reset}`,
    `${colors.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`
  ];
  
  console.log('\n' + bannerLines.join('\n') + '\n');
}

async function getPointStats(axiosInstance) {
  try {
    const response = await axiosInstance.get('https://api2.flow3.tech/api/user/get-point-stats');
    return response.data.data;
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Error fetching point stats:${colors.reset}`, error.message);
    if (error.response) {
      console.error(`${colors.red}Error details:${colors.reset}`, error.response.data);
    }
    return null;
  }
}

async function getTasks(axiosInstance) {
  try {
    const response = await axiosInstance.get('https://api2.flow3.tech/api/task/get-user-task');
    return response.data.data;
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Error fetching tasks:${colors.reset}`, error.message);
    if (error.response) {
      console.error(`${colors.red}Error details:${colors.reset}`, error.response.data);
    }
    return [];
  }
}

async function claimTask(axiosInstance, taskId) {
  try {
    const response = await axiosInstance.post(
      'https://api2.flow3.tech/api/task/claim-task',
      { taskId }
    );
    
    if (response.data.result === 'success') {
      console.log(`${colors.green}${emojis.success} Task ${taskId} claimed successfully!${colors.reset}`);
      return true;
    } else {
      console.log(`${colors.yellow}${emojis.warning} Task ${taskId} claim response: ${JSON.stringify(response.data)}${colors.reset}`);
      return false;
    }
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Error claiming task ${taskId}:${colors.reset}`, error.message);
    if (error.response) {
      console.error(`${colors.red}Error details:${colors.reset}`, error.response.data);
    }
    return false;
  }
}

function printPointStats(stats, tokenIndex) {
  if (!stats) {
    console.log(`${colors.yellow}${emojis.warning} No point stats available for token #${tokenIndex + 1}${colors.reset}`);
    return;
  }
  
  console.log(`\n${colors.cyan}${emojis.money} BALANCE INFORMATION (TOKEN #${tokenIndex + 1}) ${emojis.money}${colors.reset}`);
  console.log(`${colors.cyan}------------------------------------------${colors.reset}`);
  console.log(`${colors.white}${emojis.star} Total Points:         ${colors.green}${stats.totalPointEarned.toFixed(2)}${colors.reset}`);
  console.log(`${colors.white}${emojis.check} Task Points:          ${colors.green}${stats.totalPointTask.toFixed(2)}${colors.reset}`);
  console.log(`${colors.white}${emojis.rocket} Internet Points:      ${colors.green}${stats.totalPointInternet.toFixed(2)}${colors.reset}`);
  console.log(`${colors.white}${emojis.info} Referral Points:      ${colors.green}${stats.totalPointReferral.toFixed(2)}${colors.reset}`);
  console.log(`${colors.white}${emojis.time} Today's Earnings:     ${colors.green}${stats.todayPointEarned.toFixed(2)}${colors.reset}`);
  console.log(`${colors.white}${emojis.money} Earning Rate:         ${colors.green}${stats.earningRate.toFixed(2)}/day${colors.reset}`);
  console.log(`${colors.cyan}------------------------------------------${colors.reset}\n`);
}

async function processTokenTasks(token, tokenIndex, useProxy = true) {
  try {
    console.log(`\n${colors.white}${emojis.key} Processing Token #${tokenIndex + 1}${colors.reset}`);

    let proxy = null;
    if (useProxy && proxies.length > 0) {
      proxy = getRandomProxy();
    }

    const axiosInstance = createAxiosInstance(token, proxy);

    const tasks = await getTasks(axiosInstance);
    console.log(`${colors.white}${emojis.info} Found ${colors.yellow}${tasks.length}${colors.white} tasks for token #${tokenIndex + 1}${colors.reset}`);
    
    let claimedCount = 0;
    let failedCount = 0;
    let alreadyClaimedCount = 0;

    for (const task of tasks) {
      const statusColor = 
        task.status === 'idle' ? colors.yellow :
        task.status === 'pending' ? colors.cyan :
        task.status === 'claimed' ? colors.green : colors.white;
      
      const statusEmoji = 
        task.status === 'idle' ? emojis.pending :
        task.status === 'pending' ? emojis.pending :
        task.status === 'claimed' ? emojis.success : emojis.info;
        
      console.log(`${colors.white}${emojis.info} Processing: ${colors.bright}${task.name}${colors.reset} ${colors.white}(${statusColor}${task.status} ${statusEmoji}${colors.white}) - ${colors.green}${task.pointAmount} points${colors.reset}`);

      const claimResult = await claimTask(axiosInstance, task._id);
      
      if (claimResult) {
        claimedCount++;
      } else if (task.status === 'claimed') {
        alreadyClaimedCount++;
      } else {
        failedCount++;
      }

      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    console.log(`\n${colors.white}${emojis.info} Task processing summary for token #${tokenIndex + 1}:${colors.reset}`);
    console.log(`${colors.green}${emojis.success} Successfully claimed: ${claimedCount}${colors.reset}`);
    console.log(`${colors.yellow}${emojis.pending} Already claimed: ${alreadyClaimedCount}${colors.reset}`);
    console.log(`${colors.red}${emojis.error} Failed to claim: ${failedCount}${colors.reset}`);

    const pointStats = await getPointStats(axiosInstance);
    printPointStats(pointStats, tokenIndex);
    
    return { claimedCount, alreadyClaimedCount, failedCount };
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Error processing token #${tokenIndex + 1}:${colors.reset}`, error.message);
    return { claimedCount: 0, alreadyClaimedCount: 0, failedCount: 0 };
  }
}

function reloadTokensAndProxies() {
  try {
    const newTokens = loadTokens();
    const newProxies = loadProxies();

    tokens = newTokens;
    proxies = newProxies;
    
    console.log(`${colors.green}${emojis.change} Tokens and proxies reloaded successfully${colors.reset}`);
    return true;
  } catch (error) {
    console.error(`${colors.red}${emojis.error} Error reloading tokens and proxies:${colors.reset}`, error.message);
    return false;
  }
}

async function runBot() {
  printBanner();
  console.log(`${colors.green}${emojis.rocket} Starting Flow3 Multi-Token Task Bot...${colors.reset}`);

  tokens = loadTokens();
  proxies = loadProxies();
  
  let cycleCount = 1;
  
  while (true) {
    try {
      console.log(`\n${colors.white}${emojis.time} Starting cycle #${cycleCount}${colors.reset}`);
      console.log(`${colors.white}${'-'.repeat(50)}${colors.reset}`);

      reloadTokensAndProxies();
      
      let totalClaimed = 0;
      let totalAlreadyClaimed = 0;
      let totalFailed = 0;

      for (let i = 0; i < tokens.length; i++) {
        const result = await processTokenTasks(tokens[i], i, proxies.length > 0);
        totalClaimed += result.claimedCount;
        totalAlreadyClaimed += result.alreadyClaimedCount;
        totalFailed += result.failedCount;

        if (i < tokens.length - 1) {
          console.log(`${colors.yellow}${emojis.time} Waiting 5 seconds before processing next token...${colors.reset}`);
          await new Promise(resolve => setTimeout(resolve, 5000));
        }
      }

      console.log(`\n${colors.white}${emojis.info} CYCLE #${cycleCount} TOTAL SUMMARY:${colors.reset}`);
      console.log(`${colors.white}${'-'.repeat(50)}${colors.reset}`);
      console.log(`${colors.green}${emojis.success} Total successfully claimed: ${totalClaimed}${colors.reset}`);
      console.log(`${colors.yellow}${emojis.pending} Total already claimed: ${totalAlreadyClaimed}${colors.reset}`);
      console.log(`${colors.red}${emojis.error} Total failed to claim: ${totalFailed}${colors.reset}`);
      console.log(`${colors.white}${'-'.repeat(50)}${colors.reset}`);

      const waitSeconds = 600;
      console.log(`${colors.yellow}${emojis.time} Waiting ${waitSeconds} seconds before next cycle...${colors.reset}`);

      for (let i = waitSeconds; i > 0; i--) {
        process.stdout.write(`\r${colors.yellow}${emojis.time} Next cycle in: ${colors.bright}${i}${colors.reset} seconds`);
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      process.stdout.write('\r' + ' '.repeat(60) + '\r'); 
      
      cycleCount++;
    } catch (error) {
      console.error(`${colors.red}${emojis.error} Error in main bot loop:${colors.reset}`, error.message);
      console.log(`${colors.yellow}${emojis.pending} Menunggu 600 detik untuk point selanjutnya...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, 600 * 1000));
    }
  }
}

runBot().catch(error => {
  console.error(`${colors.red}${emojis.error} Fatal error in bot:${colors.reset}`, error);
});
