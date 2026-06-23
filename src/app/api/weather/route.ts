import { NextResponse } from 'next/server';

const API_KEY = process.env.OPENWEATHER_API_KEY;
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export async function GET(req: Request) {
    if (!API_KEY) {
        return NextResponse.json({ error: 'Weather API not configured.' }, { status: 500 });
    }

    const { searchParams } = new URL(req.url);
    const city = searchParams.get('city') || 'Nairobi';
    const lat = searchParams.get('lat');
    const lon = searchParams.get('lon');

    try {
        let forecastUrl: string;
        let currentUrl: string;

        if (lat && lon) {
            forecastUrl = `${BASE_URL}/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
            currentUrl = `${BASE_URL}/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;
        } else {
            forecastUrl = `${BASE_URL}/forecast?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
            currentUrl = `${BASE_URL}/weather?q=${encodeURIComponent(city)}&units=metric&appid=${API_KEY}`;
        }

        const [forecastRes, currentRes] = await Promise.all([
            fetch(forecastUrl),
            fetch(currentUrl),
        ]);

        if (!forecastRes.ok || !currentRes.ok) {
            const err = await forecastRes.json().catch(() => ({}));
            const msg = (err as {message?:string}).message || 'City not found';

            // API key not activated yet — return Nairobi fallback data
            if (forecastRes.status === 401 || currentRes.status === 401) {
                return NextResponse.json({
                    current: { temp: 24, feels_like: 25, humidity: 65, wind: 4.1, description: 'partly cloudy', icon: '02d', city: 'Nairobi', country: 'KE', pressure: 1016, visibility: 10000, sunrise: Math.floor(Date.now()/1000) - 21600, sunset: Math.floor(Date.now()/1000) + 21600 },
                    daily: [
                        { date: new Date().toISOString().split('T')[0], temp_min: 18, temp_max: 27, temp_avg: 22, icon: '02d', description: 'partly cloudy', humidity: 60, wind: 3.5 },
                    ],
                    _fallback: true,
                    _message: 'API key pending activation. Showing estimated Nairobi weather. Your key: ' + API_KEY.slice(0, 8) + '...',
                });
            }

            return NextResponse.json({ error: msg }, { status: 404 });
        }

        const forecastData = await forecastRes.json();
        const currentData = await currentRes.json();

        // Group forecast by day (API returns 3-hour intervals)
        const dailyMap = new Map<string, { temps: number[]; icons: string[]; descs: string[]; humidity: number[]; wind: number[] }>();
        for (const item of (forecastData.list || [])) {
            const date = item.dt_txt.split(' ')[0];
            if (!dailyMap.has(date)) dailyMap.set(date, { temps: [], icons: [], descs: [], humidity: [], wind: [] });
            const d = dailyMap.get(date)!;
            d.temps.push(item.main.temp);
            d.icons.push(item.weather[0].icon);
            d.descs.push(item.weather[0].description);
            d.humidity.push(item.main.humidity);
            d.wind.push(item.wind.speed);
        }

        const daily = Array.from(dailyMap.entries()).slice(0, 5).map(([date, d]) => {
            const mostFreq = (arr: string[]) => arr.sort((a, b) => arr.filter(v => v === a).length - arr.filter(v => v === b).length).pop() || arr[0];
            return {
                date,
                temp_min: Math.round(Math.min(...d.temps)),
                temp_max: Math.round(Math.max(...d.temps)),
                temp_avg: Math.round(d.temps.reduce((a, b) => a + b, 0) / d.temps.length),
                icon: mostFreq(d.icons),
                description: mostFreq(d.descs),
                humidity: Math.round(d.humidity.reduce((a, b) => a + b, 0) / d.humidity.length),
                wind: Math.round(d.wind.reduce((a, b) => a + b, 0) / d.wind.length * 10) / 10,
            };
        });

        return NextResponse.json({
            current: {
                temp: Math.round(currentData.main.temp),
                feels_like: Math.round(currentData.main.feels_like),
                humidity: currentData.main.humidity,
                wind: currentData.wind.speed,
                description: currentData.weather[0].description,
                icon: currentData.weather[0].icon,
                city: currentData.name,
                country: currentData.sys.country,
                pressure: currentData.main.pressure,
                visibility: currentData.visibility,
                sunrise: currentData.sys.sunrise,
                sunset: currentData.sys.sunset,
            },
            daily,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch weather data.' }, { status: 500 });
    }
}
