# V1 Privacy Masking and Consent

## Pre-claim masking policy (final)
- Pre-claim requester label in group and master preview:
  - Uzbek Cyrillic: `Мижоз #SR-XXXXXX`
  - Russian: `Клиент #SR-XXXXXX`
- No personal name before successful claim.

## PII visibility by stage

### 1) Telegram group dispatch card
Visible:
- `public_code`
- service domain
- issue tag/custom issue type (short)
- urgency
- preferred time (`asap` or scheduled slot)
- coarse area only (district/zone)
- short summary

Hidden:
- full name
- phone number
- exact address
- full landmark
- photo originals/metadata

### 2) Master Mini App preview before claim
Visible:
- masked alias (`Мижоз #SR-XXXXXX` / `Клиент #SR-XXXXXX`)
- short summary
- urgency
- preferred time
- coarse area

Hidden:
- full name
- phone number
- exact address
- full landmark
- raw attachments metadata

### 3) After successful atomic claim
Visible to winning master only:
- full requester name
- full phone number
- exact address
- full landmark
- photos

## Consent copy (required before dispatch)

### Uzbek Cyrillic
`Сўровни юбориш орқали, хизматни бажариш учун зарур маълумотларим (телефон рақами, манзил, мўлжал ва юкланган суратлар) фақат тасдиқланган усталарга берилишига рози бўламан.`

### Russian
`Отправляя заявку, я соглашаюсь на передачу моих данных, необходимых для выполнения услуги (номер телефона, адрес, ориентир и загруженные фото), только подтвержденным мастерам.`

## Confirm button labels
- Uzbek Cyrillic: `Розиман ва юбориш`
- Russian: `Согласен(на) и отправить`
