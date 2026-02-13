/**
 * 포트 관리 스크립트
 * 
 * 기본 포트(3000)가 사용 중이면 다음 사용 가능한 포트를 찾습니다.
 * .env.local 파일에 PORT 환경변수를 자동 설정합니다.
 * 
 * @author Performance Optimization Team
 * @version 1.0.0
 */

const net = require("net");
const fs = require("fs");
const path = require("path");

// ============================================================================
// 설정
// ============================================================================

const CONFIG = {
  DEFAULT_PORT: 3000,
  MAX_PORT: 65535,
  PORT_RANGE: [3000, 3010], // 먼저 시도할 포트 범위
  ENV_FILE: ".env.local",
  HOST: "127.0.0.1",
};

// ============================================================================
// 로깅 유틸리티
// ============================================================================

const logger = {
  info: (msg) => console.log(`[PortManager] ℹ️  ${msg}`),
  success: (msg) => console.log(`[PortManager] ✅ ${msg}`),
  warning: (msg) => console.log(`[PortManager] ⚠️  ${msg}`),
  error: (msg) => console.log(`[PortManager] ❌ ${msg}`),
};

// ============================================================================
// 포트 체크 함수
// ============================================================================

/**
 * 특정 포트가 사용 가능한지 확인
 * @param {number} port - 확인할 포트 번호
 * @returns {Promise<boolean>} - 사용 가능하면 true
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    
    server.once("error", (err) => {
      if (err.code === "EADDRINUSE") {
        resolve(false);
      } else {
        resolve(false);
      }
    });
    
    server.once("listening", () => {
      server.close();
      resolve(true);
    });
    
    server.listen(port, CONFIG.HOST);
  });
}

/**
 * 사용 가능한 포트 찾기
 * @param {number} startPort - 시작 포트
 * @returns {Promise<number | null>} - 사용 가능한 포트 또는 null
 */
async function findAvailablePort(startPort = CONFIG.DEFAULT_PORT) {
  logger.info(`Finding available port starting from ${startPort}...`);
  
  // 먼저 설정된 범위 내에서 찾기
  for (let port = startPort; port <= CONFIG.PORT_RANGE[1]; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
    logger.warning(`Port ${port} is in use`);
  }
  
  // 범위 내에서 찾지 못하면 더 넓은 범위 검색
  logger.info(`Searching in extended range...`);
  for (let port = 3050; port <= 3100; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  
  return null;
}

/**
 * 특정 포트에서 실행 중인 프로세스 확인
 * @param {number} port - 확인할 포트
 * @returns {Promise<string | null>} - 프로세스 정보
 */
async function getProcessOnPort(port) {
  return new Promise((resolve) => {
    const { exec } = require("child_process");
    const platform = process.platform;
    
    let command;
    if (platform === "win32") {
      command = `netstat -ano | findstr :${port}`;
    } else {
      command = `lsof -i :${port} | grep LISTEN`;
    }
    
    exec(command, (error, stdout) => {
      if (error || !stdout) {
        resolve(null);
        return;
      }
      resolve(stdout.trim());
    });
  });
}

// ============================================================================
// 환경 변수 관리
// ============================================================================

/**
 * .env.local 파일에서 PORT 읽기
 * @returns {number | null} - 저장된 포트 또는 null
 */
function getPortFromEnv() {
  try {
    const envPath = path.join(process.cwd(), CONFIG.ENV_FILE);
    
    if (!fs.existsSync(envPath)) {
      return null;
    }
    
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/^PORT=(\d+)/m);
    
    if (match) {
      return parseInt(match[1], 10);
    }
    
    return null;
  } catch (error) {
    logger.error(`Failed to read env file: ${error.message}`);
    return null;
  }
}

/**
 * .env.local 파일에 PORT 설정
 * @param {number} port - 설정할 포트
 */
function setPortInEnv(port) {
  try {
    const envPath = path.join(process.cwd(), CONFIG.ENV_FILE);
    let content = "";
    
    // 기존 파일 내용 읽기
    if (fs.existsSync(envPath)) {
      content = fs.readFileSync(envPath, "utf8");
    }
    
    // PORT 줄 교체 또는 추가
    const portRegex = /^PORT=.*$/m;
    const newPortLine = `PORT=${port}`;
    
    if (portRegex.test(content)) {
      content = content.replace(portRegex, newPortLine);
    } else {
      content = content.trim() + `\n${newPortLine}\n`;
    }
    
    // 파일 쓰기
    fs.writeFileSync(envPath, content, "utf8");
    logger.success(`Updated ${CONFIG.ENV_FILE} with PORT=${port}`);
    
  } catch (error) {
    logger.error(`Failed to write env file: ${error.message}`);
    throw error;
  }
}

/**
 * .env.local에서 PORT 제거
 */
function removePortFromEnv() {
  try {
    const envPath = path.join(process.cwd(), CONFIG.ENV_FILE);
    
    if (!fs.existsSync(envPath)) {
      return;
    }
    
    let content = fs.readFileSync(envPath, "utf8");
    content = content.replace(/^PORT=.*\n?/gm, "");
    fs.writeFileSync(envPath, content, "utf8");
    
    logger.info("Removed PORT from env file");
  } catch (error) {
    logger.error(`Failed to remove port from env: ${error.message}`);
  }
}

// ============================================================================
// 메인 함수
// ============================================================================

/**
 * 포트 관리자 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  logger.info("Starting port manager...");
  
  switch (command) {
    case "check":
      await checkPort();
      break;
    case "set":
      await setPort(args[1]);
      break;
    case "reset":
      await resetPort();
      break;
    case "auto":
    default:
      await autoConfigurePort();
      break;
  }
}

/**
 * 현재 포트 상태 확인
 */
async function checkPort() {
  const envPort = getPortFromEnv();
  const portToCheck = envPort || CONFIG.DEFAULT_PORT;
  
  logger.info(`Checking port ${portToCheck}...`);
  
  const isAvailable = await isPortAvailable(portToCheck);
  
  if (isAvailable) {
    logger.success(`Port ${portToCheck} is available`);
  } else {
    logger.warning(`Port ${portToCheck} is in use`);
    const process = await getProcessOnPort(portToCheck);
    if (process) {
      logger.info(`Process: ${process.split("\n")[0]}`);
    }
  }
  
  // 환경 변수에 설정된 포트 출력
  if (envPort) {
    logger.info(`Configured PORT in env: ${envPort}`);
  } else {
    logger.info(`Using default PORT: ${CONFIG.DEFAULT_PORT}`);
  }
}

/**
 * 특정 포트 강제 설정
 */
async function setPort(portArg) {
  const port = parseInt(portArg, 10);
  
  if (isNaN(port) || port < 1024 || port > CONFIG.MAX_PORT) {
    logger.error(`Invalid port: ${portArg}`);
    process.exit(1);
  }
  
  const isAvailable = await isPortAvailable(port);
  
  if (!isAvailable) {
    logger.warning(`Port ${port} is currently in use`);
    const process = await getProcessOnPort(port);
    if (process) {
      logger.info(`Process: ${process.split("\n")[0]}`);
    }
    logger.info(`Setting anyway...`);
  }
  
  setPortInEnv(port);
  logger.success(`Port set to ${port}`);
}

/**
 * 포트 설정 초기화
 */
async function resetPort() {
  removePortFromEnv();
  logger.success("Port configuration reset to default");
}

/**
 * 자동 포트 설정
 * 기본 포트가 사용 중이면 사용 가능한 포트를 찾아 설정
 */
async function autoConfigurePort() {
  const currentPort = getPortFromEnv();
  const portToCheck = currentPort || CONFIG.DEFAULT_PORT;
  
  logger.info(`Current configuration: PORT=${currentPort || "default (3000)"}`);
  
  // 현재 포트 사용 가능 여부 확인
  const isAvailable = await isPortAvailable(portToCheck);
  
  if (isAvailable) {
    logger.success(`Port ${portToCheck} is available`);
    
    // 기본 포트가 아니고 env에 설정된 경우, 기본 포트로 되돌릴지 확인
    if (portToCheck !== CONFIG.DEFAULT_PORT) {
      const defaultAvailable = await isPortAvailable(CONFIG.DEFAULT_PORT);
      if (defaultAvailable) {
        logger.info(`Default port ${CONFIG.DEFAULT_PORT} is now available`);
        logger.info(`Consider running: node scripts/port-manager.js reset`);
      }
    }
    
    return;
  }
  
  // 사용 중인 경우 새 포트 찾기
  logger.warning(`Port ${portToCheck} is in use`);
  const process = await getProcessOnPort(portToCheck);
  if (process) {
    logger.info(`Process: ${process.split("\n")[0]}`);
  }
  
  // 새 포트 찾기
  const newPort = await findAvailablePort(CONFIG.DEFAULT_PORT);
  
  if (!newPort) {
    logger.error("Could not find an available port");
    process.exit(1);
  }
  
  logger.success(`Found available port: ${newPort}`);
  
  // .env.local에 설정
  setPortInEnv(newPort);
  
  // 안내 메시지
  console.log("\n" + "=".repeat(50));
  console.log("📋 Next steps:");
  console.log("=".repeat(50));
  console.log(`1. Port ${newPort} has been configured in .env.local`);
  console.log(`2. Run: npm run dev`);
  console.log(`3. Your app will be available at: http://localhost:${newPort}`);
  console.log("=".repeat(50) + "\n");
}

// ============================================================================
// 실행
// ============================================================================

if (require.main === module) {
  main().catch((error) => {
    logger.error(`Unexpected error: ${error.message}`);
    process.exit(1);
  });
}

// 모듈로도 남성
module.exports = {
  isPortAvailable,
  findAvailablePort,
  getPortFromEnv,
  setPortInEnv,
  CONFIG,
};
