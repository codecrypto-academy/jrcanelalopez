# MOLIENDA Microservice

Microservicio que consume eventos `almacen-event` de Kafka y crea tokens MOLIENDA en la blockchain combinando dos tokens ALMACEN.

## Descripción

Este servicio:

1. Consume mensajes del topic `almacen-event` de Kafka
2. Extrae los IDs de dos tokens ALMACEN
3. Llama a `createTokenWithParents()` en el contrato para crear un token MOLIENDA
4. Publica el nuevo token al topic `molienda-event` para el siguiente servicio (HORNEADO)
