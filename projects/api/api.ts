import * as fileSystem from 'fs';

import {
  AddHeroModel,
  HeroModel,
} from '../workshops-app/src/app/services/heroes/hero.model';
import {
  IncomingMessage,
  Server,
  ServerResponse,
  createServer,
} from 'node:http';

export class Api {
  private readonly fileName: string = 'projects/api/heroes.json';
  private readonly backupFileName: string = 'projects/api/heroes.backup.json';
  private readonly fileEncoding: BufferEncoding = 'utf8';
  private heroes: HeroModel[];
  private highestId: number;
  private readonly hostname: string = '127.0.0.1';
  private readonly port: number = 5000;
  private readonly server: Server;

  public constructor() {
    if (fileSystem.existsSync(this.fileName)) {
      this.heroes = JSON.parse(
        fileSystem.readFileSync(this.fileName, this.fileEncoding)
      );
    } else {
      if (fileSystem.existsSync(this.backupFileName)) {
        this.heroes = JSON.parse(
          fileSystem.readFileSync(this.backupFileName, this.fileEncoding)
        );
      } else {
        this.heroes = [];

        fileSystem.writeFileSync(
          this.backupFileName,
          JSON.stringify(this.heroes, null, 2),
          {
            encoding: 'utf8',
          }
        );
      }

      fileSystem.writeFileSync(
        this.fileName,
        JSON.stringify(this.heroes, null, 2),
        {
          encoding: 'utf8',
        }
      );
    }

    this.highestId = this.heroes.reduce(
      (highestId: number, hero: HeroModel): number =>
        Math.max(highestId, hero.id),
      0
    );

    this.server = createServer(this.listenForRequests);
    this.server.listen(this.port, this.hostname, () => {
      console.log(`Server running at http://${this.hostname}:${this.port}/`);
    });
  }

  private readonly listenForRequests = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    console.log(`Request: ${request.method} ${request.url}`);
    this.setCorsHeaders(response);

    if (request.url?.startsWith('/api/heroes')) {
      this.handleHeroesRequest(request, response);
    } else {
      response.statusCode = 404;
      response.end();
    }
  };

  private readonly setCorsHeaders = (
    response: ServerResponse<IncomingMessage>
  ): void => {
    response.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    response.setHeader(
      'Access-Control-Allow-Methods',
      'POST, GET, PUT, DELETE, OPTIONS'
    );
    response.setHeader('Access-Control-Allow-Headers', '*');
  };

  private readonly handleHeroesRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    switch (request.method) {
      case 'POST':
        this.handleCreateHeroRequest(request, response);
        break;
      case 'GET':
        this.handleReadHeroRequest(request, response);
        break;
      case 'PUT':
        this.handlePutRequest(request, response);
        break;
      case 'DELETE':
        this.handleDeleteHeroRequest(request, response);
        break;
      case 'OPTIONS':
        this.handleOptionsRequest(response);
        break;
    }
  };

  private readonly handleCreateHeroRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    let requestBodyString: string = '';

    request.addListener('data', (chunk: Buffer): void => {
      const chunkString: string = chunk.toString('utf8');
      requestBodyString = `${requestBodyString}${chunkString}`;
    });
    request.addListener('end', (): void => {
      request.removeAllListeners('data');
      request.removeAllListeners('end');

      const requestBody: any = JSON.parse(requestBodyString);

      if (this.getIsAddHeroModel(requestBody)) {
        const newHero: HeroModel = { ...requestBody, id: ++this.highestId };
        this.heroes.push(newHero);
        this.writeHeroDataFileSync();

        this.createJsonResponse(response, 201, newHero);
      } else {
        this.createErrorResponse(response, 400, ['Invalid hero data']);
      }
    });
  };

  private readonly handleReadHeroRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    if (request.url?.startsWith('/api/heroes?')) {
      this.handleSearchHeroesRequest(request, response);
    } else {
      this.handleGetHeroRequest(request, response);
    }
  };

  private readonly handlePutRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    if (request.url?.startsWith('/api/heroes/top-heroes/reset')) {
      this.handleResetTopHeroesRequest(request, response);
    } else {
      this.handleUpdateHeroRequest(request, response);
    }
  };

  private readonly handleResetTopHeroesRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    this.heroes = this.heroes.map(
      (hero: HeroModel): HeroModel => ({ ...hero, views: 0 })
    );

    this.writeHeroDataFileSync();
    this.handleTopHeroesRequest(request, response);
  };

  private readonly handleUpdateHeroRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    let requestBodyString: string = '';

    request.addListener('data', (chunk: Buffer): void => {
      const chunkString: string = chunk.toString('utf8');
      requestBodyString = `${requestBodyString}${chunkString}`;
    });
    request.addListener('end', (): void => {
      request.removeAllListeners('data');
      request.removeAllListeners('end');

      const requestBody: any = JSON.parse(requestBodyString);
      let index: number;

      if (
        this.getIsHeroModel(requestBody) &&
        (index = this.getHeroIndexById(requestBody.id)) >= 0
      ) {
        this.heroes[index] = requestBody;
        this.writeHeroDataFileSync();

        this.createEmptyResponse(response, 201);
      } else {
        this.createErrorResponse(response, 400, ['Invalid hero data']);
      }
    });
  };

  private readonly handleSearchHeroesRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    const queryParams: [string, string][] = this.getQueryParams(request);
    const searchTerm: string = this.getQueryParamValue(
      'searchTerm',
      queryParams
    ).toLowerCase();
    const pageNumberValue: string = this.getQueryParamValue(
      'pageNumber',
      queryParams
    );
    const pageSizeValue: string = this.getQueryParamValue(
      'pageSize',
      queryParams
    );

    const results: HeroModel[] = this.heroes
      .filter(
        (hero: HeroModel): boolean =>
          hero.name.toLowerCase().includes(searchTerm) ||
          hero.description.toLowerCase().includes(searchTerm)
      )
      .sort(this.compareHeroes);

    const pageSize: number = parseInt(pageSizeValue);
    const startIndex: number = parseInt(pageNumberValue) * pageSize;

    if (startIndex >= 0 && (startIndex === 0 || startIndex < results.length)) {
      this.createJsonResponse(response, 200, {
        heroes: results.slice(startIndex, startIndex + pageSize),
        totalResultCount: results.length,
      });
    } else {
      this.createErrorResponse(response, 400, ['Invalid page number']);
    }
  };

  private readonly handleGetHeroRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    if (request.url?.startsWith('/api/heroes/top-heroes?')) {
      this.handleTopHeroesRequest(request, response);
    } else {
      this.handleGetHeroByIdRequest(request, response);
    }
  };

  private readonly handleTopHeroesRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    const queryParams = this.getQueryParams(request);
    const topHeroCountValue: string = this.getQueryParamValue(
      'count',
      queryParams
    );
    const count: number = parseInt(topHeroCountValue);

    if (count) {
      this.createJsonResponse(
        response,
        200,
        [...this.heroes]
          .sort(
            (hero1: HeroModel, hero2: HeroModel): number =>
              hero2.views - hero1.views
          )
          .slice(0, count)
      );
    } else {
      this.createErrorResponse(response, 400, [
        'Invalid top hero count query parameter',
      ]);
    }
  };

  private readonly handleGetHeroByIdRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    const heroId: number = this.getHeroIdFromUrl(request);
    const heroIndex: number = this.getHeroIndexById(heroId);

    if (heroIndex > 0) {
      this.createJsonResponse(response, 200, this.heroes[heroIndex]);
    } else {
      this.createErrorResponse(response, 400, [
        `Hero not found, id: ${heroId}`,
      ]);
    }
  };

  private readonly handleDeleteHeroRequest = (
    request: IncomingMessage,
    response: ServerResponse<IncomingMessage>
  ): void => {
    const heroId: number = this.getHeroIdFromUrl(request);
    const heroIndex: number = this.getHeroIndexById(heroId);

    if (heroIndex > 0) {
      this.heroes.splice(heroIndex, 1);
      this.writeHeroDataFileSync();
    }

    this.createEmptyResponse(response, 204);
  };

  private readonly handleOptionsRequest = (
    response: ServerResponse<IncomingMessage>
  ): void => {
    response.statusCode = 200;
    this.setCorsHeaders(response);
    response.end();
  };

  private readonly getHeroIdFromUrl = (request: IncomingMessage): number => {
    const urlParts: string[] = request.url?.split('/') || [];
    return parseInt(urlParts[urlParts.length - 1]);
  };

  private readonly getQueryParams = (
    request: IncomingMessage
  ): [string, string][] =>
    (request.url?.split('?') || ['', ''])[1]
      .split('&')
      .map((paramAndValue: string): [string, string] => {
        const paramValuePair = paramAndValue.split('=');
        return [decodeURI(paramValuePair[0]), decodeURI(paramValuePair[1])];
      });

  private readonly getQueryParamValue = (
    paramName: string,
    nameValuePairs: [string, string][]
  ): string =>
    (nameValuePairs.find(
      ([name]: [string, string]): boolean => name === paramName
    ) || ['', ''])[1];

  private readonly createErrorResponse = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    messages: string[]
  ): void => {
    this.createJsonResponse(response, statusCode, {
      messages: messages,
    });
  };

  private readonly createJsonResponse = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number,
    value: any
  ): void => {
    response.statusCode = statusCode;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify(value));
  };

  private readonly createEmptyResponse = (
    response: ServerResponse<IncomingMessage>,
    statusCode: number
  ): void => {
    response.statusCode = statusCode;
    response.setHeader('Content-Length', '0');
    response.end();
  };

  private readonly getIsHeroModel = (value: any): value is HeroModel =>
    this.getIsAddHeroModel(value) &&
    'id' in value &&
    typeof value.id === 'number';

  private readonly getIsAddHeroModel = (value: any): value is AddHeroModel =>
    'name' in value &&
    typeof value.name === 'string' &&
    'description' in value &&
    typeof value.description === 'string' &&
    'imageUrl' in value &&
    typeof value.imageUrl === 'string' &&
    'views' in value &&
    typeof value.views === 'number';

  private readonly compareHeroes = (
    hero1: HeroModel,
    hero2: HeroModel
  ): number => hero1.name.localeCompare(hero2.name);

  private readonly writeHeroDataFileSync = (): void => {
    fileSystem.writeFileSync(
      this.fileName,
      JSON.stringify(this.heroes, null, 2),
      { encoding: this.fileEncoding }
    );
  };

  private readonly getHeroIndexById = (id: number): number =>
    this.heroes.findIndex(
      (currentHero: HeroModel): boolean => currentHero.id === id
    );
}

new Api();
