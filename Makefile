NODE_VERSION = 16

build-linux:
	npm run pkg -- -t node$(NODE_VERSION)-linux-x64 -o drosse && tar -czf drosse.linux.tar.gz drosse && rm drosse

build-macos:
	npm run pkg -- -t node$(NODE_VERSION)-macos-x64 -o drosse && tar -czf drosse.macos.tar.gz drosse && rm drosse

build-windows:
	npm run pkg -- -t node$(NODE_VERSION)-win-x64 -o drosse.exe && zip drosse.windows.zip drosse.exe && rm drosse.exe
