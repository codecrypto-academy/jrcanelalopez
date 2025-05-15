se create carpeta /data y fichero fichero.txt

node generar-claves.js --name receptor
node generar-claves.js --name emisor

node encriptar-fichero.js --public receptor --private emisor --data fichero.txt

node desencriptar-fichero.js --private receptor --public emisor --data fichero.txt
