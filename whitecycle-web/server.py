import http.server
import socketserver

handler = http.server.SimpleHTTPRequestHandler
with socketserver.TCPServer(('', 8888), handler) as httpd:
    print('Serving on port 8888')
    httpd.serve_forever()