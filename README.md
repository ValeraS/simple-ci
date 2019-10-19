# Домашнее задание «Инфраструктура»

Сервер и агенты запускаются каждый в своем `docker` контейнере. Контейнеры создаются
на базе контейнера с `nodejs`. Он занимает порядка 950 Мб.

Далее приведен пример запуска сервера и агентов на одной локальной машине.
Для этого в `docker` нужно создать пользовательскую сеть

```sh
docker network create ci-net # ci-net можно заменить на любое другое имя
```

## Сборка и запуск сервера

```sh
cd server
npm run build-docker-image
docker run -d -p 3000:3000 --rm --name ci-server --network ci-net valera-s/ci-server path-to-repo
```
При этих настройках, интерфейс сервера будет доступен на `localhost:3000`.

## Сборка и запуск агентов

```sh
cd agent
npm run build-docker-image
```
Для запуска агентов используется следующая команда:

```sh
docker run -d --rm --name ci-agent --network ci-net valera-s/ci-agent ci-server 3000 ci-agent 8000
```

Последние четыре параметра являются входящими параметрами агента. Для запуска еще одного агента,
нужно в команде выше дважды заменить `ci-agent` на любое другое имя.


## Требования:

* **Сервер должен максимально утилизировать имеющихся агентов**

    В момент создания сборки, завершения сборки и добавления агента происходит проверка наличия
    задач на сборку и свободных агентов.

* **Сервер должен корректно обрабатывать ситуацию, когда агент прекратил работать между сборками**

    В случае ошибки `/build` сервер удаляет агента.

* **Сервер должен корректно обрабатывать ситуацию, когда агент прекратил работать в процессе выполнения сборки**

    После старта сборки, сервер периодически опрашивает агента, выполняющего задание.
    Если агент не отвечает, то он удаляется из списка агентов, а задание опять
    помещается в очередь выполнения заданий.

* **Сервер должен корректно обрабатывать ситуацию, когда агенты не справляются с поступающими заявками**

    Сборки помещаются в очередь выполнения. При появлении свободного агента очередное
    задание посылается на выполнение.

* **Агент должен корректно обрабатывать ситуацию, когда не смог соединиться с сервером**

    При невозможности связаться с сервером, агент завершает свою работу.