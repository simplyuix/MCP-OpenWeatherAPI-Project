import { spawn } from 'child_process';
import type { ChildProcessWithoutNullStreams } from 'child_process';


const baseReturnedPrompt = "This response is returned from the api you need to parse it the following is the data returned from api: ";

let requestIdCounter = 1;
const activeRequests = new Map<string, { resolve: (value: any) => void, reject: (reason?: any) => void }>();

function callServerTool(
    serverProcess: ChildProcessWithoutNullStreams,
    method: string,
    params: any
): Promise<any> {
    return new Promise((resolve, reject) => {
        const currentId = `req-${requestIdCounter++}`;
        const message = {
            jsonrpc: '2.0',
            id: currentId,
            method: method,
            params: params,
        };

        console.log(`[Client] Sending to server: ${JSON.stringify(message)}`);
        try {
            serverProcess.stdin.write(JSON.stringify(message) + '\n');
        } catch (error) {
            console.error(`[Client] Error writing to server stdin:`, error);
            return reject(new Error('Failed to write to server stdin.'));
        }
        
        activeRequests.set(currentId, { resolve, reject });
    });
}

async function main() {
    const serverCommand = 'bun';
    const serverArgs = ['run', 'index.ts']; 

    console.log(`[Client] Spawning server: ${serverCommand} ${serverArgs.join(' ')}`);

    const serverProcess = spawn(serverCommand, serverArgs, {
        cwd: process.cwd(), 
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: process.platform === 'win32' 
    });

    let stdoutBuffer = '';
    serverProcess.stdout.on('data', (data: Buffer) => {
        const chunk = data.toString();
        stdoutBuffer += chunk;

        console.log(`[Client] Raw data from server stdout: \n---START SERVER STDOUT CHUNK---\n${chunk}\n---END SERVER STDOUT CHUNK---`);
        
        let newlineIndex;
        while ((newlineIndex = stdoutBuffer.indexOf('\n')) !== -1) {
            const jsonString = stdoutBuffer.substring(0, newlineIndex);
            stdoutBuffer = stdoutBuffer.substring(newlineIndex + 1);

            if (jsonString.trim() === '') continue;

            console.log(`[Client] Attempting to parse potential JSON message: ${jsonString}`);
            try {
                const response = JSON.parse(jsonString);
                if (response.id && activeRequests.has(response.id)) {
                    const promiseCallbacks = activeRequests.get(response.id);
                    if (promiseCallbacks) {
                        if (response.error) {
                            console.error(`[Client] Server returned an error for ID ${response.id}:`, response.error);
                            promiseCallbacks.reject(response.error);
                        } else {
                            console.log(`[Client] Server returned a result for ID ${response.id}.`);
                            promiseCallbacks.resolve(response.result);
                        }
                        activeRequests.delete(response.id);
                    }
                } else if (response.method) { 
                     console.log(`[Client] Received a non-response MCP message (e.g., notification/request) from server: ${jsonString}`);
                }
                else {
                    //
                    console.log(`[Client] Interpreting as server diagnostic log: ${jsonString}`);
                }
            } catch (error) {
               
                console.error(`[Client] Line from server is not JSON (likely a diagnostic log): "${jsonString}"`);
            }
        }
    });

    serverProcess.stderr.on('data', (data: Buffer) => {
        console.error(`[Server STDERR] ${data.toString()}`);
    });

    serverProcess.on('close', (code: number | null) => {
        console.log(`[Client] Server process exited with code ${code}`);
        activeRequests.forEach(cb => cb.reject(new Error(`Server process exited prematurely with code ${code}`)));
        activeRequests.clear();
    });

    serverProcess.on('error', (err: Error) => {
        console.error('[Client] Failed to start server process:', err);
        process.exit(1); 
    });


    console.log('[Client] Waiting for server to signal it is listening...');
    await new Promise<void>((resolve, reject) => {
        const readyListener = (data: Buffer) => {
            if (data.toString().includes("[Server] Transport connected. Server is listening.")) {
                console.log("[Client] Server is ready!");
                serverProcess.stdout.removeListener('data', readyListener); 
                resolve();
            }
        };
        serverProcess.stdout.on('data', readyListener);
   
        setTimeout(() => {
            serverProcess.stdout.removeListener('data', readyListener);
            reject(new Error("Timeout: Server didn't signal readiness."));
        }, 10000); 
    });

    try {
        console.log('\n[Client] Calling: getWeather'); 
const weatherResult: any = await callServerTool(
    serverProcess,
    'getWeather', 
    { latitude: 40.7128, longitude: -74.0060 } 
);
        
        if (weatherResult && weatherResult.content && weatherResult.content[0] && weatherResult.content[0].text) {
            const weatherText = weatherResult.content[0].text;
            if (weatherText.startsWith(baseReturnedPrompt)) {
                const weatherDataJson = weatherText.substring(baseReturnedPrompt.length);
                const weatherData = JSON.parse(weatherDataJson);
                console.log('[Client] Parsed Current Weather Data:', JSON.stringify(weatherData, null, 2));
            } else {
                console.log('[Client] Current Weather Response Text (unexpected format):', weatherText);
            }
        } else {
            console.log('[Client] Current Weather Result (unexpected structure):', weatherResult);
        }

        console.log('\n[Client] Calling: get-next-5days-forecast-weather-from-latitude-and-longitude');
        const forecastResult: any = await callServerTool(
            serverProcess,
            'get-next-5days-forecast-weather-from-latitude-and-longitude', 
            { latitude: 34.0522, longitude: -118.2437 } 
        );
        if (forecastResult && forecastResult.content && forecastResult.content[0] && forecastResult.content[0].text) {
            const forecastText = forecastResult.content[0].text;
            if (forecastText.startsWith(baseReturnedPrompt)) {
                const forecastDataJson = forecastText.substring(baseReturnedPrompt.length);
                const forecastData = JSON.parse(forecastDataJson);
                console.log('[Client] Parsed Forecast Data:', JSON.stringify(forecastData, null, 2));
            } else {
                console.log('[Client] Forecast Response Text (unexpected format):', forecastText);
            }
        } else {
            console.log('[Client] Forecast Result (unexpected structure):', forecastResult);
        }

        console.log('\n[Client] Calling: get-shortened-url');
        const shortUrlResult: any = await callServerTool(
            serverProcess,
            'get-shortened-url',
            { url: 'https://www.example.com', urlName: 'aman-site-ts' }
        );

        if (shortUrlResult && shortUrlResult.content && shortUrlResult.content[0] && shortUrlResult.content[0].text) {
            const shortUrlText = shortUrlResult.content[0].text;
             if (shortUrlText.startsWith(baseReturnedPrompt)) {
                const shortUrlDataJson = shortUrlText.substring(baseReturnedPrompt.length);
                const shortUrlData = JSON.parse(shortUrlDataJson);
                console.log('[Client] Parsed Shortened URL Data:', JSON.stringify(shortUrlData, null, 2));
            } else {
                 console.log('[Client] Short URL Response Text (unexpected format):', shortUrlText);
            }
        } else {
             console.log('[Client] Short URL Result (unexpected structure):', shortUrlResult);
        }

    } catch (error) {
        console.error('[Client] An error occurred during tool calls:', error);
    } finally {
        console.log('\n[Client] All operations finished. Terminating server process.');
        if (serverProcess.stdin && !serverProcess.stdin.writableEnded) {
            serverProcess.stdin.end(() => {
                console.log('[Client] Server stdin stream ended.');
            });
        }
     
        await new Promise(resolve => setTimeout(resolve, 200)); 
        if (!serverProcess.killed && serverProcess.kill()) { 
             console.log('[Client] Server process termination signal sent.');
        } else {
             console.log('[Client] Server process already exited or could not be killed.');
        }
    }
}

main().catch(err => {
    console.error("[Client] Unhandled error in main function:", err);
    process.exit(1);
});