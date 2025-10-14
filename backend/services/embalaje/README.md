# EMBALAJE Microservice

Microservicio que consume eventos `horneado-event` de Kafka y crea tokens EMBALAJE en la blockchain combinando dos tokens HORNEADO.

## Descripción

Este servicio:

1. Consume mensajes del topic `horneado-event` de Kafka
2. Extrae los IDs de dos tokens HORNEADO
3. Llama a `createTokenWithParents()` en el contrato para crear un token EMBALAJE
4. Publica el nuevo token al topic `embalaje-event` para el siguiente servicio (DISTRIBUCION)
