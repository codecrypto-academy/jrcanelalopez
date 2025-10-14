# HORNEADO Microservice

Microservicio que consume eventos `molienda-event` de Kafka y crea tokens HORNEADO en la blockchain combinando dos tokens MOLIENDA.

## Descripción

Este servicio:

1. Consume mensajes del topic `molienda-event` de Kafka
2. Extrae los IDs de dos tokens MOLIENDA
3. Llama a `createTokenWithParents()` en el contrato para crear un token HORNEADO
4. Publica el nuevo token al topic `horneado-event` para el siguiente servicio (EMBALAJE)
