import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';


test.describe('API Challenge', () => {
   let baseURL = 'https://apichallenges.herokuapp.com/';
   let token;
   let defaultXmlTodo = `<?xml version="1.0"?>
   <todo>
      <title> ${faker.lorem.word()} </title>
   </todo>`;


   test.beforeAll(async ({ request }) => {

      let response = await request.post(`${baseURL}challenger`);
      const headers = response.headers();

      expect(headers).toEqual(expect.objectContaining({ 'x-challenger': expect.any(String) }));

      token = headers['x-challenger'];
   });

   test('02 - Можно получить спиоск заданий GET /challenges api', { tag: '@get' }, async ({ request }) => {
      let endpoint = 'challenges';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('03 - Список todo можно получить GET /todos api', { tag: '@get' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });


      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('04 - Todo нельзя получить по ошибочному эндпоинту GET /todo api', { tag: '@get' }, async ({ request }) => {
      let endpoint = 'todo';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(404);
   });

   test('05 - Todo можно получить по id  GET /todos/{id} api', { tag: '@get' }, async ({ request }) => {
      let id = 1;
      let endpoint = `todos/${id}`;
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('06 - Todo нельзя получить указав по несуществующему id GET /todos/{id} api', { tag: '@get' }, async ({ request }) => {
      let id = Math.random() * 100;
      let endpoint = `todos/${id}`;
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(404);
   });

   test('07 - Todo можно получить с фильтром по статусу GET /todos?doneStatus=true api', { tag: '@get' }, async ({ request }) => {
      let filter = 'doneStatus=true';
      let endpoint = `todos?${filter}`;

      await request.post(`${baseURL}todos`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': true,
               'description': faker.lorem.paragraph(1)
            },
            headers: {
               'x-challenger': token
            }
         });

      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(200);
   });


   test('08 - Получение заголовков todo HEAD /todos api', { tag: '@head' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.head(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(200);
   });

   test('09 - Todo можно создать POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(201);
   });

   test('10 - Todo нельзя создать с неверным doneStatus POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      let doneStatus = 'true';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.words(3),
               'doneStatus': doneStatus,
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(400);
   });

   test('11 - Todo нельзя создать с большим title POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      const title = faker.string.sample(51);
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': title,
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(400);
   });

   test('12 - Todo нельзя создать с большим description POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      const description = faker.string.sample(201);
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': description
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(400);
   });


   test('13 - Todo можно создать с максимальной длиной title и description POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      const title = faker.string.sample(50);
      const description = faker.string.sample(200);

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': title,
               'doneStatus': faker.datatype.boolean(),
               'description': description
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(201);
   });

   test('14 - Todo нельзя создать с максимальной телом больше чем 5000 символов POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      const title = faker.string.sample(2500);
      const description = faker.string.sample(2500);

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': title,
               'doneStatus': faker.datatype.boolean(),
               'description': description
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(413);
   });

   test('15 - Todo нельзя создать с лишним полем POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph(),
               'author': faker.person.firstName()
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(400);
   });

   test('16 - Todo нельзя создать PUT-методом PUT /todos/{id} api', { tag: '@put' }, async ({ request }) => {
      let id = Math.random() * 100;
      let endpoint = `todos/${id}`;

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(400);
   });

   test('17 - Todo можно обновить POST-методом POST /todos/{id} api', { tag: '@post' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph(),
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(200);
   });

   test('18 - Несуществующий todo нельзя обновить POST-методом POST /todos/{id} api', { tag: '@post' }, async ({ request }) => {
      let id = Math.random() * 100;
      let endpoint = `todos/${id}`;

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph(),
            },
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(404);
   });


   test('19 - Существующий todo можно обновить заполнив все поля PUT /todos/{id} api', { tag: '@put' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.words(2)
            },
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(200);
   });

   test('20 - Существующий todo можно обновить заполнив только обязательные поля PUT /todos/{id} api', { tag: '@put' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word(),
            },
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(200);
   });

   test('21 - Существующий todo нельзя обновить без поля title PUT /todos/{id} api', { tag: '@put' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            data: {
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(400);
   });

   test('22 - Существующий todo нельзя изменить если id в теле запроса отличается PUT /todos/{id} api', { tag: '@put' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            data: {
               'id': id + 1,
               'title': faker.lorem.word(),
               'doneStatus': faker.datatype.boolean(),
               'description': faker.lorem.paragraph()
            },
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(400);
   });

   test('23 - Существующий todo можно удалить DELETE /todos/{id} api', { tag: '@delete' }, async ({ request }) => {
      let todos = await (await request.get(`${baseURL}todos`)).json();
      let id = todos.todos[0].id;
      let endpoint = `todos/${id}`;

      let response = await request.delete(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         }
      );
      expect(response.status()).toBe(200);
   });

   test('24 - Получение списка разрешенных методов OPTIONS /todos api', { tag: '@options' }, async ({ request }) => {
      let endpoint = `todos`;

      let response = await request.fetch(`${baseURL}${endpoint}`,
         {
            method: 'options',
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(200);
      expect(response.headers().allow).toContain('OPTIONS, GET, HEAD, POST')
   });

   test('25 - Список todos можно получить в XML формате GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': 'application/xml',
               'x-challenger': token
            }
         }
      );

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/xml' }));
      expect(response.status()).toBe(200);
   });

   test('26 - Список todos можно получить в JSON формате GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': 'application/json',
               'x-challenger': token
            }
         }
      );

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/json' }));
      expect(response.status()).toBe(200);
   });

   test('27 - Список todos по-умолчанию приходит в JSON формате GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': '*/*',
               'x-challenger': token
            }
         }
      );
      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/json' }));
      expect(response.status()).toBe(200);
   });

   test('28 - Предпочтительный формат todos - XML GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': 'application/xml, application/json',
               'x-challenger': token
            }
         }
      );

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/xml' }));
      expect(response.status()).toBe(200);
   });

   test('29 - Список todos приходит в JSON формате если не указать Accept GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': '',
               'x-challenger': token
            }
         }
      );

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/json' }));
      expect(response.status()).toBe(200);
   });

   test('30 - Список todos нельзя получить в формате GZIP GET /todos api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'Accept': 'application/gzip',
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(406);
      expect(response.statusText()).toEqual('Not Acceptable');
   });

   test('31 - Todo можно создать с Content-Type `application/xml` POST /todos api', { tag: '@POST' }, async ({ request }) => {
      let endpoint = 'todos';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: defaultXmlTodo,
            headers: {
               'Accept': 'application/xml',
               'Content-Type': 'application/xml',
               'x-challenger': token
            }
         });

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/xml' }));
      expect(response.status()).toBe(201);
   });

   test('32 - Todo можно создать с Content-Type `application/json` POST /todos api', { tag: '@POST' }, async ({ request }) => {
      let endpoint = 'todos';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word()
            },
            headers: {
               'Accept': 'application/json',
               'Content-Type': 'application/json',
               'x-challenger': token
            }
         });

      expect(response.headers()).toEqual(expect.objectContaining({ 'x-challenger': token, 'content-type': 'application/json' }));
      expect(response.status()).toBe(201);
   });

   test('33 - 415 ошибка при попытке создать Todo с неподдерживаемым Content-Type POST api', { tag: '@POST' }, async ({ request }) => {
      let endpoint = 'todos';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               'title': faker.lorem.word()
            },
            headers: {
               'Accept': 'text/html',
               'Content-Type': 'text/html',
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(415);
   });

   test('34 - Можно получить прогресс по challenger GUID GET /challenger/guid api', { tag: '@get' }, async ({ request }) => {
      let endpoint = `challenger/${token}`;
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('35 - Можно восстановить прогресс по challenger GUID PUT /challenger/guid RESTORE api', { tag: '@put' }, async ({ request }) => {
      let endpoint = `challenger/${token}`;
      let challengerData = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      let challengerDataBody = await challengerData.json();

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            },
            data: challengerDataBody
         });

      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('36 - Создаем нового challenger и восстанавливаем ему прогресс PUT /challenger/guid CREATE api', { tag: '@put' }, async ({ request }) => {
      let endpoint = `challenger/${token}`;
      let challengerData = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      let challengerDataBody = await challengerData.json();

      token = faker.string.uuid();
      challengerDataBody.xChallenger = token;
      endpoint = `challenger/${token}`

      let response = await request.put(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            },
            data: challengerDataBody
         });
      expect(response.status()).toBe(201);
      expect(response.statusText()).toBe('Created');
   });

   test('37 - Можно получить текущую базу todos challenger GET /challenger/database/guid api', { tag: '@get' }, async ({ request }) => {
      let endpoint = `challenger/database/${token}`;
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      expect(response.status()).toBe(200);
      expect(response.statusText()).toBe('OK');
   });

   test('38 - Можно отправить todos challenger PUT /challenger/database/guid api', { tag: '@put' }, async ({ request }) => {
      let endpoint = `challenger/database/${token}`;
      let dataBase = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               "Content-Type": "application/json"
            }
         });
      let dataBaseBody = dataBase.json();
      let response = await request.put(`${baseURL}${endpoint}`,
         {
            headers: {
               'X-CHALLENGER': token,
               'Content-Type': 'Application/json'
            },
            data: dataBaseBody
         });
      expect(response.status()).toBe(204);
   });

   test('39 - Todo можно создать с Content-Type `application/xml`, но Accept `application/json` POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: defaultXmlTodo,
            headers: {
               'Content-Type': `application/xml`,
               'Accept': 'application/json',
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(201);
   });

   test('40 - Todo можно создать с Content-Type `application/json`, но Accept `application/xml` POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            data: {
               title: faker.lorem.word()
            },
            headers: {
               'Content-Type': `application/json`,
               'Accept': 'application/xml',
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(201);
   });

   test('41 - 405 при запросе DELETE /heartbeat api', { tag: '@delete' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.delete(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(405);
   });

   test('42 - 500 при запросе PATCH /heartbeat api', { tag: '@patch' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.patch(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(500);
   });

   test('43 - 501 при запросе TRACE /heartbeat api', { tag: '@trace' }, async ({ request }) => {
      let endpoint = 'heartbeat';

      let response = await request.fetch(`${baseURL}${endpoint}`,
         {
            method: 'trace',
            headers: {
               'x-challenger': token
            }
         }
      );

      expect(response.status()).toBe(501);
   });

   test('44 - 204 при запросе GET /heartbeat api', { tag: '@get' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(204);
   });

   test('45 - 405 при переопределении метода POST на DELETE POST /heartbeat api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'X-HTTP-Method-Override': 'DELETE',
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(405);
   });

   test('46 - 500 при переопределении метода POST на PATCH POST /heartbeat api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'X-HTTP-Method-Override': 'PATCH',
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(500);
   });

   test('47 - 501 при переопределении метода POST на TRACE POST /heartbeat api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'heartbeat';
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'X-HTTP-Method-Override': 'TRACE',
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(501);
   });

   test('48 - 401 при попытке авторизоваться не-администратором /secret/token api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/token';
      let authData = btoa('qa:guru');
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'Authorization': `Basic ${authData}`,
               'X-CHALLENGER': token
            }
         });
      expect(response.statusText()).toBe('Unauthorized');
      expect(response.status()).toBe(401);
   });

   test('49 - 201 при попытке авторизоваться администратором /secret/token api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/token';
      let authData = btoa('admin:password');
      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'Authorization': `Basic ${authData}`,
               'X-CHALLENGER': token
            }
         });
      expect(response.statusText()).toBe('Created');
      expect(response.status()).toBe(201);
   });

   test('50 - 403 при передаче невалидного X-AUTH-TOKEN GET /secret/note api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'secret/note';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'X-AUTH-TOKEN': faker.string.uuid()
            }
         });
      expect(response.status()).toBe(403);
   });

   test('51 - 401 если не передан X-AUTH-TOKEN GET /secret/note api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'secret/note';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      expect(response.status()).toBe(401);
   });

   test('52 - Получаем note при передаче валидного X-AUTH-TOKEN GET /secret/note api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let challengerInfo = await (await request.get(`${baseURL}challenger/${token}`,
         {
            headers: { 'x-challenger': token }
         }
      )).json();
      let xAuthToken = await challengerInfo.xAuthToken;

      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'X-AUTH-TOKEN': xAuthToken
            }
         });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('note');
   });

   test('53 - note успешно отправляется при валидном X-AUTH-TOKEN post /secret/note api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let challengerInfo = await (await request.get(`${baseURL}challenger/${token}`,
         {
            headers: { 'x-challenger': token }
         }
      )).json();
      let xAuthToken = await challengerInfo.xAuthToken;

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'X-AUTH-TOKEN': xAuthToken
            },
            data: { "note": faker.lorem.words(3) }
         });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('note');
   });

   test('54 - 401 при попытке отправить note без X-AUTH-TOKEN post /secret/note api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            },
            data: { "note": faker.lorem.words(3) }
         });
      expect(response.status()).toBe(401);
   });

   test('55 - 403 при попытке отправить note без X-AUTH-TOKEN post /secret/note api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'X-AUTH-TOKEN': 'xAuthToken'
            },
            data: { "note": faker.lorem.words(3) }
         });
      expect(response.status()).toBe(403);
   });

   test('56 - Получаем note при передаче валидного bearer X-AUTH-TOKEN GET /secret/note api', { tag: '@GET' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let challengerInfo = await (await request.get(`${baseURL}challenger/${token}`,
         {
            headers: { 'x-challenger': token }
         }
      )).json();
      let xAuthToken = await challengerInfo.xAuthToken;

      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'Authorization': `Bearer ${xAuthToken}`
            }
         });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('note');
   });

   test('57 - note успешно отправляется при валидном Bearer X-AUTH-TOKEN post /secret/note api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'secret/note';

      let challengerInfo = await (await request.get(`${baseURL}challenger/${token}`,
         {
            headers: { 'x-challenger': token }
         }
      )).json();
      let xAuthToken = await challengerInfo.xAuthToken;

      let response = await request.post(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token,
               'Authorization': `Bearer ${xAuthToken}`
            },
            data: { "note": faker.lorem.words(3) }
         });
      expect(response.status()).toBe(200);
      expect(await response.text()).toContain('note');
   });

   test('58 - Удаление всех todo пользователя DELETE /todos/{id} api', { tag: '@DELETE' }, async ({ request }) => {
      let endpoint = 'todos';
      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      let todoList = await (await response.json()).todos;
      let todoId;

      for (let i = todoList.length - 1; i >= 0; i--) {
         todoId = todoList[i].id;
         await request.delete(`${baseURL}${endpoint}/${todoId}`,
            {
               headers: {
                  'x-challenger': token
               }
            });
      }

      let result = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      let resultTodoList = await (await result.json()).todos;
      expect(resultTodoList.length).toEqual(0);
   });

   test('59 - Создание максимального количества todo POST /todos api', { tag: '@post' }, async ({ request }) => {
      let endpoint = 'todos';
      const maxTodo = 20;

      let response = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });

      let todoList = await (await response.json()).todos;

      for (let i = todoList.length; i <= maxTodo; i++) {
         await request.post(`${baseURL}${endpoint}`,
            {
               data: {
                  'title': faker.lorem.word(),
                  'doneStatus': faker.datatype.boolean(),
                  'description': faker.lorem.paragraph()
               },
               headers: {
                  'x-challenger': token
               }
            });
      }

      let result = await request.get(`${baseURL}${endpoint}`,
         {
            headers: {
               'x-challenger': token
            }
         });
      let resultTodoList = await (await result.json()).todos;
      expect(resultTodoList.length).toEqual(maxTodo);
   });

   test.afterAll('Получаем ссылку на результат челенджа', async ({ request }) => {
      const endpoint = 'gui/challenges/';
      let results = `${baseURL}${endpoint}${token}`;
      console.log(results);
   });
});