#!/bin/bash

echo "=========================================="
echo "Nav Website API 测试脚本"
echo "=========================================="
echo ""

BASE_URL="http://localhost:3000"

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 测试计数
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

test_api() {
    local test_name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_status=$5
    local auth_token=$6
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo -n "测试 $TOTAL_TESTS: $test_name ... "
    
    local headers="-H 'Content-Type: application/json'"
    if [ ! -z "$auth_token" ]; then
        headers="$headers -H 'Authorization: Bearer $auth_token'"
    fi
    
    if [ "$method" == "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" $BASE_URL$endpoint)
    else
        response=$(curl -s -w "\n%{http_code}" -X $method $BASE_URL$endpoint -H "Content-Type: application/json" $( [ ! -z "$auth_token" ] && echo "-H 'Authorization: Bearer $auth_token'" ) -d "$data")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$status_code" == "$expected_status" ]; then
        echo -e "${GREEN}✓ 通过${NC} (HTTP $status_code)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        echo -e "${RED}✗ 失败${NC} (期望: $expected_status, 实际: $status_code)"
        echo "  响应: $body"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

echo "1. 测试基础接口"
echo "------------------------------------------"
test_api "根路径访问" "GET" "/" "" "200"
echo ""

echo "2. 测试认证接口"
echo "------------------------------------------"
test_api "登录 - 缺少参数" "POST" "/api/auth/login" '{}' "400"
test_api "登录 - 错误密码" "POST" "/api/auth/login" '{"username":"admin","password":"wrong"}' "401"
test_api "登录 - 正确凭证" "POST" "/api/auth/login" '{"username":"admin","password":"123456"}' "200"

# 获取 Token
TOKEN=$(curl -s -X POST $BASE_URL/api/auth/login -H "Content-Type: application/json" -d '{"username":"admin","password":"123456"}' | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}错误: 无法获取认证 Token，后续测试将跳过${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Token 获取成功${NC}"
echo ""

echo "3. 测试菜单接口"
echo "------------------------------------------"
test_api "获取菜单列表" "GET" "/api/menu" "" "200"
test_api "创建菜单 - 无认证" "POST" "/api/menu" '{"name":"测试菜单"}' "401"
test_api "创建菜单 - 缺少名称" "POST" "/api/menu" '{"order_index":1}' "400" "$TOKEN"
test_api "创建菜单 - 成功" "POST" "/api/menu" '{"name":"测试菜单","icon":"","order_index":1}' "200" "$TOKEN"
echo ""

echo "4. 测试卡片接口"
echo "------------------------------------------"
test_api "获取卡片列表" "GET" "/api/card" "" "200"
test_api "创建卡片 - 无认证" "POST" "/api/card" '{"title":"测试"}' "401"
test_api "创建卡片 - 缺少标题" "POST" "/api/card" '{"url":"http://example.com"}' "400" "$TOKEN"
test_api "创建卡片 - 缺少URL" "POST" "/api/card" '{"title":"测试"}' "400" "$TOKEN"
test_api "创建卡片 - 成功" "POST" "/api/card" '{"title":"测试卡片","url":"http://example.com","menu_id":1}' "200" "$TOKEN"
echo ""

echo "5. 测试广告接口"
echo "------------------------------------------"
test_api "获取广告列表" "GET" "/api/ad" "" "200"
test_api "创建广告 - 无认证" "POST" "/api/ad" '{"image":"test.jpg"}' "401"
echo ""

echo "6. 测试友链接口"
echo "------------------------------------------"
test_api "获取友链列表" "GET" "/api/friend" "" "200"
test_api "创建友链 - 无认证" "POST" "/api/friend" '{"name":"测试"}' "401"
echo ""

echo "7. 测试用户接口"
echo "------------------------------------------"
test_api "获取用户列表 - 无认证" "GET" "/api/user" "" "401"
test_api "获取用户列表 - 有认证" "GET" "/api/user" "" "200" "$TOKEN"
echo ""

echo "8. 测试 404 处理"
echo "------------------------------------------"
test_api "不存在的接口" "GET" "/api/notfound" "" "404"
echo ""

echo "=========================================="
echo "测试完成"
echo "=========================================="
echo -e "总计: $TOTAL_TESTS 个测试"
echo -e "${GREEN}通过: $PASSED_TESTS${NC}"
echo -e "${RED}失败: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}所有测试通过! ✓${NC}"
    exit 0
else
    echo -e "${RED}部分测试失败${NC}"
    exit 1
fi
