import * as fileSystem from 'fs';

const promiseFileSystem = fileSystem.promises;
console.warn(process.argv);
const directories: string[] = process.argv.slice(2);

if (!directories.length) {
  directories.push('./projects/workshops-app/');
}

interface CharactersAndLines {
  readonly characterCount: number;
  readonly lineCount: number;
}
const result: { [fileName: string]: CharactersAndLines } = {};

const getCharactersOfCodeInDirectory = async (
  directory: string
): Promise<void> => {
  if (!directory.endsWith('/')) {
    directory = directory + '/';
  }
  const files: string[] = await promiseFileSystem.readdir(directory);

  await Promise.all<void>(
    files.map(async (file: string): Promise<void> => {
      const stat = await promiseFileSystem.stat(directory + file);

      if (stat.isDirectory()) {
        await getCharactersOfCodeInDirectory(directory + file + '/');
      } else if (
        (file.endsWith('.ts') || file.endsWith('.html')) &&
        !file.endsWith('.spec.ts')
      ) {
        await processFile(directory + file);
      }
    })
  );
};

const processFile = async (fileName: string): Promise<void> => {
  const lines: string[] = await (
    await promiseFileSystem.readFile(fileName, {
      encoding: 'utf8',
    })
  )
    .split('\n')
    .map((line: string): string => line.trim())
    .filter(
      (line: string): boolean =>
        line.length > 0 && !line.startsWith('//') && !line.startsWith('import')
    );

  result[fileName] = {
    lineCount: lines.length,
    characterCount: lines.join('').length,
  };
};

await Promise.all<void>(directories.map(getCharactersOfCodeInDirectory));

let totalCharacterCount: number = 0;
let totalLineCount: number = 0;

Object.entries(result)
  .sort(
    (
      [fileName1]: [string, CharactersAndLines],
      [fileName2]: [string, CharactersAndLines]
    ): number => fileName1.localeCompare(fileName2)
  )
  .forEach(
    ([fileName, charactersAndLines]: [string, CharactersAndLines]): void => {
      totalCharacterCount += charactersAndLines.characterCount;
      totalLineCount += charactersAndLines.lineCount;
      console.log(
        fileName,
        charactersAndLines.characterCount,
        'characters',
        charactersAndLines.lineCount,
        'lines'
      );
    }
  );

console.log(
  '\nCharacters of code in',
  directories.join(' & '),
  totalCharacterCount
);
console.log('Lines of code in', directories.join(' & '), totalLineCount);
