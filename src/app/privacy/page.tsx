import React from 'react';
import { Footer } from "@/components/layout/Footer";

export const metadata = {
  title: "Privacy Policy - LOLES",
};

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-black">
      <div className="flex-1 w-full max-w-3xl mx-auto px-6 py-20 md:py-32">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
          Privacy Policy
        </h1>
        <p className="text-neutral-500 mb-12">Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
        
        <div className="space-y-10 text-neutral-300 leading-relaxed">
          
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. What data we collect</h2>
            <p className="text-neutral-400 mb-3">
              We try to collect as little personal data as possible. To make the app work, we collect:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-neutral-400">
              <li><strong>Account Info:</strong> Your email address and securely hashed password when you sign up.</li>
              <li><strong>Riot Games Data:</strong> If you link your Riot Account, we fetch and store your summoner name, rank, match history, and performance stats via the official Riot API.</li>
              <li><strong>User Content:</strong> The private matchup notes and strategies you write. These are stored securely in our database.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Cookies and Local Storage</h2>
            <p className="text-neutral-400">
              We use essential cookies and local storage purely to keep you logged into the application and to securely manage your session. We do not use third-party tracking cookies or sell your browsing data to advertisers.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Data Storage and Hosting</h2>
            <p className="text-neutral-400">
              Your data is hosted on secure cloud servers provided by Amazon Web Services (AWS). All connections between your browser and our servers are encrypted via HTTPS, and your passwords are cryptographically hashed before being stored in the database.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Third-Party Sharing</h2>
            <p className="text-neutral-400">
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. We do, however, transmit your Riot ID to the official Riot Games API strictly in order to fetch your match history and statistics.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Account Deletion</h2>
            <p className="text-neutral-400">
              You own your data. You can unlink your Riot Account at any time from your settings, which immediately deletes all fetched match data from our database. If you wish to delete your entire account and all associated notes, you can do so by contacting us directly.
            </p>
          </section>

        </div>
      </div>
      <Footer />
    </div>
  );
}
