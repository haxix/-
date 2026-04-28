# 白循 WhiteCycle - 一键安装配置脚本
# 适用于 Windows PowerShell

Write-Host "======================================" -ForegroundColor Cyan
Write-Host "  白循 WhiteCycle 安装配置向导" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# 步骤 1: 检查 XAMPP 是否安装
Write-Host "[1/5] 检查 XAMPP 安装..." -ForegroundColor Yellow
if (Test-Path "C:\xampp\apache\bin\httpd.exe") {
    Write-Host "✓ XAMPP 已安装" -ForegroundColor Green
} else {
    Write-Host "✗ XAMPP 未安装" -ForegroundColor Red
    Write-Host ""
    Write-Host "请先安装 XAMPP:" -ForegroundColor Cyan
    Write-Host "1. 访问：https://www.apachefriends.org/download.html" -ForegroundColor White
    Write-Host "2. 下载 Windows 版本" -ForegroundColor White
    Write-Host "3. 安装到 C:\xampp" -ForegroundColor White
    Write-Host ""
    Write-Host "安装完成后重新运行此脚本" -ForegroundColor Yellow
    exit
}

# 步骤 2: 检查服务状态
Write-Host ""
Write-Host "[2/5] 检查服务状态..." -ForegroundColor Yellow
$apacheRunning = Get-Process -Name "httpd" -ErrorAction SilentlyContinue
$mysqlRunning = Get-Process -Name "mysqld" -ErrorAction SilentlyContinue

if ($apacheRunning) {
    Write-Host "✓ Apache 正在运行" -ForegroundColor Green
} else {
    Write-Host "✗ Apache 未运行" -ForegroundColor Red
    Write-Host "  请在 XAMPP Control Panel 中启动 Apache" -ForegroundColor Yellow
}

if ($mysqlRunning) {
    Write-Host "✓ MySQL 正在运行" -ForegroundColor Green
} else {
    Write-Host "✗ MySQL 未运行" -ForegroundColor Red
    Write-Host "  请在 XAMPP Control Panel 中启动 MySQL" -ForegroundColor Yellow
}

if (-not $apacheRunning -or -not $mysqlRunning) {
    Write-Host ""
    Write-Host "请先启动 Apache 和 MySQL 服务" -ForegroundColor Yellow
    Write-Host "按任意键继续..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

# 步骤 3: 配置数据库连接
Write-Host ""
Write-Host "[3/5] 配置数据库连接..." -ForegroundColor Yellow
$dbConfigPath = "php\config\database.php"

if (Test-Path $dbConfigPath) {
    $content = Get-Content $dbConfigPath -Raw
    $content = $content -replace "define\('DB_PASS', '.*?'\)", "define('DB_PASS', '')"
    Set-Content $dbConfigPath -Value $content
    Write-Host "✓ 数据库配置已更新（默认密码为空）" -ForegroundColor Green
} else {
    Write-Host "✗ 找不到数据库配置文件" -ForegroundColor Red
}

# 步骤 4: 创建数据库
Write-Host ""
Write-Host "[4/5] 创建数据库..." -ForegroundColor Yellow
Write-Host "请选择创建数据库的方式:" -ForegroundColor Cyan
Write-Host "1. 自动创建（推荐）" -ForegroundColor White
Write-Host "2. 手动创建（使用 phpMyAdmin）" -ForegroundColor White
$choice = Read-Host "请输入选项 (1/2)"

if ($choice -eq "1") {
    # 尝试自动创建
    $mysqlPath = "C:\xampp\mysql\bin\mysql.exe"
    if (Test-Path $mysqlPath) {
        & $mysqlPath -u root -e "CREATE DATABASE IF NOT EXISTS whitecycle DEFAULT CHARACTER SET utf8mb4"
        Write-Host "✓ 数据库创建成功" -ForegroundColor Green
        
        # 导入表结构
        if (Test-Path "setup_database.sql") {
            & $mysqlPath -u root whitecycle < "setup_database.sql"
            Write-Host "✓ 表结构导入成功" -ForegroundColor Green
        }
    } else {
        Write-Host "✗ 找不到 MySQL，请手动创建" -ForegroundColor Red
    }
} else {
    Write-Host ""
    Write-Host "手动创建数据库步骤:" -ForegroundColor Cyan
    Write-Host "1. 访问 http://localhost/phpmyadmin" -ForegroundColor White
    Write-Host "2. 点击'新建'创建数据库 whitecycle" -ForegroundColor White
    Write-Host "3. 选择 utf8mb4_unicode_ci 排序规则" -ForegroundColor White
    Write-Host "4. 点击'SQL'标签，粘贴 setup_database.sql 内容" -ForegroundColor White
    Write-Host "5. 点击'执行'" -ForegroundColor White
}

# 步骤 5: 测试访问
Write-Host ""
Write-Host "[5/5] 测试访问..." -ForegroundColor Yellow
Write-Host ""
Write-Host "======================================" -ForegroundColor Green
Write-Host "  安装完成！" -ForegroundColor Green
Write-Host "======================================" -ForegroundColor Green
Write-Host ""
Write-Host "访问地址:" -ForegroundColor Cyan
Write-Host "  登录页面：http://localhost/login.html" -ForegroundColor White
Write-Host "  主应用：http://localhost/index.html" -ForegroundColor White
Write-Host "  phpMyAdmin: http://localhost/phpmyadmin" -ForegroundColor White
Write-Host ""
Write-Host "测试步骤:" -ForegroundColor Cyan
Write-Host "1. 打开浏览器访问登录页面" -ForegroundColor White
Write-Host "2. 注册新账户（测试注册功能）" -ForegroundColor White
Write-Host "3. 登录后创建记录（测试数据保存）" -ForegroundColor White
Write-Host "4. 查看 phpMyAdmin 确认数据已存储" -ForegroundColor White
Write-Host ""
Write-Host "按任意键打开浏览器..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# 打开浏览器
Start-Process "http://localhost/login.html"
