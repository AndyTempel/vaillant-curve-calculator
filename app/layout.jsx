import '../styles/globals.css';

export const metadata = {
    title: 'Vaillant Heat Curve Calculator'
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" sizes="any" />
            </head>
            <body className="antialiased text-neutral-900 bg-white">
                <div className="flex flex-col min-h-screen px-6 sm:px-8">
                    <main className="w-full max-w-5xl mx-auto grow py-8">{children}</main>
                </div>
            </body>
        </html>
    );
}
