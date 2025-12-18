#!/usr/bin/env python3
"""
MCP Integration Test Script for ADX-Agent
Tests MCP gateway connectivity and tool availability
"""

import requests
import json
import time
import sys
from typing import Dict, Any

class MCPTester:
    def __init__(self, base_url: str = "http://localhost:8080"):
        self.base_url = base_url
        self.results = {}
    
    def test_gateway_health(self) -> bool:
        """Test MCP gateway health endpoint"""
        print("🏥 Testing MCP Gateway Health...")
        
        try:
            response = requests.get(f"{self.base_url}/health", timeout=10)
            if response.status_code == 200:
                data = response.json()
                print(f"✅ Gateway Status: {data.get('status', 'unknown')}")
                print(f"📊 Version: {data.get('version', 'unknown')}")
                print(f"🕐 Timestamp: {data.get('timestamp', 'unknown')}")
                return True
            else:
                print(f"❌ Gateway health check failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Gateway connection failed: {e}")
            return False
    
    def test_mcp_status(self) -> Dict[str, Any]:
        """Test detailed MCP status endpoint"""
        print("\n📊 Testing MCP Status...")
        
        try:
            response = requests.get(f"{self.base_url}/mcp/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                
                print("🔧 MCP Gateway Status:")
                gateway_status = data.get('mcp_gateway', {})
                print(f"   Status: {gateway_status.get('status', 'unknown')}")
                print(f"   Uptime: {gateway_status.get('uptime', 'unknown')}")
                
                print("\n🛠️ Tool Status:")
                tools = data.get('tools', {})
                for tool_name, tool_status in tools.items():
                    status = tool_status.get('status', 'unknown')
                    if status == 'healthy':
                        print(f"   ✅ {tool_name}: {status}")
                    elif status == 'unhealthy':
                        print(f"   ⚠️ {tool_name}: {status}")
                    else:
                        print(f"   ❓ {tool_name}: {status}")
                
                return data
            else:
                print(f"❌ MCP status check failed: {response.status_code}")
                return {}
        except Exception as e:
            print(f"❌ MCP status connection failed: {e}")
            return {}
    
    def test_tool_list(self) -> bool:
        """Test available tools list"""
        print("\n📋 Testing Available Tools...")
        
        try:
            response = requests.get(f"{self.base_url}/tools", timeout=10)
            if response.status_code == 200:
                data = response.json()
                tools = data.get('tools', [])
                print(f"✅ Found {len(tools)} tools:")
                for tool in tools:
                    print(f"   • {tool.get('name', 'unknown')}: {tool.get('description', 'no description')}")
                return True
            else:
                print(f"❌ Tool list failed: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Tool list connection failed: {e}")
            return False
    
    def test_github_tool(self) -> bool:
        """Test GitHub tool functionality"""
        print("\n🐙 Testing GitHub Tool...")
        
        try:
            # Test GitHub tool health
            response = requests.get(f"{self.base_url}/tools/github/health", timeout=10)
            if response.status_code == 200:
                print("✅ GitHub tool is accessible")
                return True
            else:
                print(f"⚠️ GitHub tool returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ GitHub tool test failed: {e}")
            return False
    
    def test_browserbase_tool(self) -> bool:
        """Test Browserbase tool functionality"""
        print("\n🌐 Testing Browserbase Tool...")
        
        try:
            # Test Browserbase tool health
            response = requests.get(f"{self.base_url}/tools/browserbase/health", timeout=10)
            if response.status_code == 200:
                print("✅ Browserbase tool is accessible")
                return True
            else:
                print(f"⚠️ Browserbase tool returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Browserbase tool test failed: {e}")
            return False
    
    def test_exa_tool(self) -> bool:
        """Test Exa tool functionality"""
        print("\n🔍 Testing Exa Tool...")
        
        try:
            # Test Exa tool health
            response = requests.get(f"{self.base_url}/tools/exa/health", timeout=10)
            if response.status_code == 200:
                print("✅ Exa tool is accessible")
                return True
            else:
                print(f"⚠️ Exa tool returned: {response.status_code}")
                return False
        except Exception as e:
            print(f"❌ Exa tool test failed: {e}")
            return False
    
    def run_comprehensive_test(self) -> Dict[str, bool]:
        """Run all MCP integration tests"""
        print("🚀 Starting MCP Integration Test Suite")
        print("=" * 50)
        
        tests = {
            "gateway_health": self.test_gateway_health(),
            "mcp_status": bool(self.test_mcp_status()),
            "tool_list": self.test_tool_list(),
            "github_tool": self.test_github_tool(),
            "browserbase_tool": self.test_browserbase_tool(),
            "exa_tool": self.test_exa_tool()
        }
        
        return tests
    
    def generate_report(self, tests: Dict[str, bool]) -> None:
        """Generate test report"""
        print("\n" + "=" * 50)
        print("📊 MCP Integration Test Report")
        print("=" * 50)
        
        passed = sum(tests.values())
        total = len(tests)
        
        print(f"\n📈 Summary: {passed}/{total} tests passed")
        
        for test_name, result in tests.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"   {test_name}: {status}")
        
        if passed == total:
            print("\n🎉 All tests passed! MCP integration is working correctly.")
        else:
            print(f"\n⚠️ {total - passed} test(s) failed. Check configuration.")
        
        # Save report
        report_data = {
            "timestamp": time.time(),
            "tests": tests,
            "summary": {
                "passed": passed,
                "total": total,
                "success_rate": f"{(passed/total)*100:.1f}%"
            }
        }
        
        with open("/app/mcp-test-report.json", "w") as f:
            json.dump(report_data, f, indent=2)
        
        print(f"\n💾 Detailed report saved to: /app/mcp-test-report.json")

def main():
    """Main test execution"""
    import argparse
    
    parser = argparse.ArgumentParser(description="MCP Integration Test Suite")
    parser.add_argument("--url", default="http://localhost:8080", 
                       help="MCP gateway URL (default: http://localhost:8080)")
    parser.add_argument("--timeout", type=int, default=30,
                       help="Request timeout in seconds (default: 30)")
    
    args = parser.parse_args()
    
    # Create tester instance
    tester = MCPTester(args.url)
    
    # Set global timeout
    requests.get = lambda *args, **kwargs: requests.get(*args, timeout=args.timeout, **kwargs)
    
    try:
        # Run tests
        tests = tester.run_comprehensive_test()
        
        # Generate report
        tester.generate_report(tests)
        
        # Exit with appropriate code
        if all(tests.values()):
            print("\n✅ All tests passed!")
            sys.exit(0)
        else:
            print("\n❌ Some tests failed!")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n\n⚠️ Test interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n\n❌ Test suite failed with error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()