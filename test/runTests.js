#!/usr/bin/env node

const { spawn } = require("child_process");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
};

// Helper function to print colored text
const print = (color, text) => {
  console.log(`${colors[color]}${text}${colors.reset}`);
};

// Helper function to print header
const printHeader = () => {
  console.log("\n" + "=".repeat(60));
  print("bright", "🧪 SCHOOL MANAGEMENT API - TEST RUNNER");
  console.log("=".repeat(60));
};

// Helper function to print help
const printHelp = () => {
  printHeader();
  console.log("\n📚 Available Commands:");
  console.log("\n🔐 Authentication Tests:");
  print("cyan", "  npm run test:auth          - Run only authentication tests");
  print(
    "cyan",
    "  npm run test:single -- --grep 'signup'  - Run specific auth tests"
  );

  console.log("\n👨‍🎓 Student Tests:");
  print("cyan", "  npm run test:students      - Run only student tests");
  print(
    "cyan",
    "  npm run test:single -- --grep 'students'  - Run student-related tests"
  );

  console.log("\n👨‍🏫 Teacher Tests:");
  print("cyan", "  npm run test:teachers      - Run only teacher tests");
  print(
    "cyan",
    "  npm run test:single -- --grep 'teachers'  - Run teacher-related tests"
  );

  console.log("\n🚀 General Test Commands:");
  print("cyan", "  npm test                    - Run all tests");
  print("cyan", "  npm run test:watch          - Run tests in watch mode");
  print("cyan", "  npm run test:coverage       - Run tests with coverage");
  print(
    "cyan",
    "  npm run test:report         - Generate HTML coverage report"
  );

  console.log("\n🎯 Custom Test Runner:");
  print("cyan", "  node test/runTests.js --help     - Show this help");
  print("cyan", "  node test/runTests.js --auth     - Run auth tests");
  print("cyan", "  node test/runTests.js --students - Run student tests");
  print("cyan", "  node test/runTests.js --teachers - Run teacher tests");
  print("cyan", "  node test/runTests.js --all      - Run all tests");

  console.log("\n💡 Tips:");
  print("yellow", "  • Use --grep to run specific test descriptions");
  print("yellow", "  • Use --timeout to adjust test timeout");
  print("yellow", "  • Use --reporter to change output format");

  console.log("\n" + "=".repeat(60));
};

// Function to run tests with specific options
const runTests = (options = []) => {
  const testSetup = path.join(__dirname, "testSetup.js");
  const mochaPath = path.join(__dirname, "..", "node_modules", ".bin", "mocha");

  const args = [
    "--require",
    testSetup,
    "--timeout",
    "10000",
    "--exit",
    "--recursive",
    "--reporter",
    "spec",
    "--colors",
    ...options,
  ];

  print("blue", `\n🚀 Running tests with options: ${args.join(" ")}`);
  console.log("⏳ Please wait...\n");

  const mocha = spawn(mochaPath, args, {
    stdio: "inherit",
    shell: true,
  });

  mocha.on("close", (code) => {
    if (code === 0) {
      print("green", "\n✅ All tests passed successfully!");
    } else {
      print("red", "\n❌ Some tests failed!");
    }
    process.exit(code);
  });

  mocha.on("error", (error) => {
    print("red", `\n💥 Error running tests: ${error.message}`);
    process.exit(1);
  });
};

// Main function
const main = () => {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printHelp();
    return;
  }

  printHeader();

  // Parse command line arguments
  if (args.includes("--auth")) {
    runTests(["tests/auth.test.js"]);
  } else if (args.includes("--students")) {
    runTests(["tests/students.test.js"]);
  } else if (args.includes("--teachers")) {
    runTests(["tests/teachers.test.js"]);
  } else if (args.includes("--all")) {
    runTests(["tests/"]);
  } else if (args.includes("--coverage")) {
    print("yellow", "\n📊 Running tests with coverage...");
    const { spawn } = require("child_process");
    const nyc = spawn("npx", ["nyc", "npm", "test"], {
      stdio: "inherit",
      shell: true,
    });
    nyc.on("close", (code) => process.exit(code));
  } else if (args.includes("--watch")) {
    print("yellow", "\n👀 Running tests in watch mode...");
    runTests(["--watch"]);
  } else {
    // Custom options passed through
    runTests(args);
  }
};

// Run if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { runTests, printHelp };
