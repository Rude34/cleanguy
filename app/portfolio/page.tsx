import Link from "next/link";
import TopSearch from "../components/TopSearch";
import { Award, Code, Heart, Briefcase, Shield, Zap, Cloud } from "lucide-react";

export const metadata = {
  title: "Portfolio | CleanGuy Tech",
};

export default function PortfolioPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-slate-700 bg-slate-900/95 backdrop-blur-md sticky top-0 z-50">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between px-6 py-4 gap-4">
          <div className="flex items-center gap-3">
            <Link href="/" className="rounded-md bg-cyan-500 px-3 py-2 text-base font-bold text-slate-950 transition hover:bg-cyan-400">
              Home
            </Link>
            <h1 className="text-xl font-black text-cyan-300">CleanGuy Tech</h1>
            <span className="text-xs text-slate-400">Portfolio</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/guides" className="text-slate-300 hover:text-cyan-300 transition text-sm font-medium">
              Guides
            </Link>
            <Link href="/about" className="text-slate-300 hover:text-cyan-300 transition text-sm font-medium">
              About
            </Link>
            <TopSearch />
          </nav>
        </div>
      </header>

      <section className="mx-auto max-w-4xl px-6 py-20">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-400">Welcome</p>
          <h1 className="mt-3 text-5xl font-bold text-cyan-100">Professional & Spiritual Portfolio</h1>
          <p className="mt-4 text-lg text-slate-300 max-w-2xl mx-auto">
            A portfolio showcasing my growth in Information Technology, cybersecurity, leadership, and service through technology.
          </p>
          <div className="mt-2 h-1 w-24 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full mx-auto"></div>
          
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <button className="rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25">
              View Projects
            </button>
            <button className="rounded-lg border border-cyan-500/50 bg-slate-900/50 px-8 py-3 text-sm font-semibold text-cyan-300 hover:bg-slate-900 hover:border-cyan-400 transition-all duration-200">
              Certifications
            </button>
          </div>
        </div>

        {/* About Me Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">About Me</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8 shadow-lg shadow-cyan-950/20">
            <p className="text-lg leading-8 text-slate-200">
              I'm <span className="font-semibold text-cyan-200">Furkan Yıldırım</span>, an Information Technology student at Ensign College with a passion for cybersecurity, troubleshooting, and technical support. I'm the founder of <span className="font-semibold text-cyan-200">CleanGuy Tech</span>, a platform dedicated to helping beginner and non-technical users solve technology problems with clear, easy-to-follow guides. I believe in the power of service through technology and am committed to continuous learning and growth in both my professional and spiritual journey.
            </p>
          </div>
        </div>

        {/* Guiding Principles Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Guiding Principles</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Heart className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Faith and Trust in God</h3>
              </div>
              <p className="text-slate-300 leading-7">
                I believe in maintaining discipline through prayer and trust in God's guidance. I strive to balance my work, education, and personal life, knowing that true success comes from aligning my efforts with my faith and values. Every challenge is an opportunity to strengthen my relationship with God and grow as a person.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Service Through Technology</h3>
              </div>
              <p className="text-slate-300 leading-7">
                I'm passionate about making technology accessible and understandable for everyone. Through CleanGuy Tech, I create beginner-friendly troubleshooting guides and cybersecurity awareness content. My goal is to empower non-technical users to solve their own problems and feel confident with technology.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-7 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="text-cyan-400" size={28} />
                <h3 className="text-xl font-semibold text-cyan-200">Leadership Through Communication</h3>
              </div>
              <p className="text-slate-300 leading-7">
                I believe effective leadership is built on integrity, honest communication, and responsibility. In IT and cybersecurity, ethical behavior is paramount. I'm committed to leading by example, fostering teamwork, and using my technical knowledge responsibly to protect and serve others.
              </p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Projects</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Briefcase className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">CleanGuy Tech</h3>
                  <p className="text-slate-300 leading-7">
                    A beginner-friendly troubleshooting and cybersecurity awareness platform designed to help users solve common Windows and networking problems. This platform serves as both my internship project and a real-world service to help people become more confident with technology.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Cloud className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">Azure Infrastructure Project</h3>
                  <p className="text-slate-300 leading-7">
                    Built Microsoft Azure virtual machines, storage systems, networking configurations, and access control environments as part of my cloud infrastructure learning. This hands-on experience deepened my understanding of cloud computing and modern IT infrastructure management.
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-8 hover:border-cyan-500/50 transition-all duration-300">
              <div className="flex items-start gap-4">
                <Shield className="text-cyan-400 shrink-0 mt-1" size={28} />
                <div>
                  <h3 className="text-2xl font-semibold text-cyan-200 mb-2">Wazuh IDS Project</h3>
                  <p className="text-slate-300 leading-7">
                    Configured and monitored an intrusion detection system environment to analyze attacks, monitor security logs, and improve my cybersecurity knowledge. This project gave me practical experience in threat detection and incident response.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Certifications & Skills Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Certifications & Skills</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="text-cyan-400" size={28} />
                <h3 className="text-2xl font-semibold text-cyan-200">Certifications</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-slate-300">Technical Support Engineer Certificate</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">✓</span>
                  <span className="text-slate-300">IT Professional Certificate</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-linear-to-br from-cyan-500/10 via-slate-900/80 to-blue-500/10 p-8">
              <div className="flex items-center gap-3 mb-6">
                <Code className="text-cyan-400" size={28} />
                <h3 className="text-2xl font-semibold text-cyan-200">Technical Skills</h3>
              </div>
              <ul className="space-y-3">
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Windows Troubleshooting</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Networking Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Linux Basics</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Cybersecurity Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Azure Fundamentals</span>
                </li>
                <li className="flex items-center gap-3">
                  <span className="text-cyan-400">▪</span>
                  <span className="text-slate-300">Technical Documentation</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Ethical Responsibility Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Ethical Responsibility in IT</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="rounded-2xl border border-cyan-500/20 bg-slate-900/50 p-8">
            <p className="text-lg leading-8 text-slate-300">
              In the field of Information Technology and cybersecurity, ethical responsibility is not optional—it is fundamental. I am deeply committed to protecting user privacy and data, understanding that people trust us with their personal information. As someone who will work with administrative privileges, I recognize the importance of using those privileges ethically and responsibly, never abusing access or overstepping boundaries. Integrity is the foundation of my work; I believe in being honest about my capabilities, transparent in my actions, and accountable for my decisions. Cybersecurity responsibility means not just defending against threats, but also educating others about best practices and security awareness. Most importantly, I understand that maintaining trust is an ongoing commitment—trust takes time to build but can be lost in an instant, so I approach every interaction with the seriousness and respect it deserves.
            </p>
          </div>
        </div>

        {/* Reflection Section */}
        <div className="mb-20">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-cyan-100">Reflection</h2>
            <div className="mt-2 h-1 w-16 bg-linear-to-r from-cyan-500 to-blue-500 rounded-full"></div>
          </div>
          
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-lg leading-8 text-slate-300">
                This journey in Information Technology has been transformative, both professionally and spiritually. I've learned that growth requires discipline and consistency—showing up every day, even when progress seems small, compounds into significant achievements over time. My faith has taught me that success is not just about reaching a destination, but about the person I become in the process. Every project, every certification, and every guide I create is an opportunity to grow as a technician and as a leader. I've discovered that the most meaningful work is service—using my technical knowledge to help others overcome challenges and feel more confident with technology.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-8">
              <p className="text-lg leading-8 text-slate-300">
                Balancing education, career goals, and faith has taught me the importance of prioritization and trust. I cannot excel in all areas simultaneously, but I can be intentional about how I spend my time and where I invest my energy. Leadership development has shown me that true influence comes from integrity and genuine care for others' growth. I'm committed to continuing this path of professional excellence and spiritual growth, knowing that by serving others through technology, I'm contributing to something larger than myself. The future is full of possibilities, and I'm excited to see where this journey leads.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Quote */}
        <div className="mb-16 text-center">
          <div className="rounded-2xl border border-cyan-500/30 bg-linear-to-r from-cyan-500/5 to-blue-500/5 p-12">
            <p className="text-2xl font-semibold italic text-cyan-100">
              "Technology becomes more meaningful when it is used to serve and help others."
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Link
            href="/guides"
            className="inline-block rounded-lg bg-linear-to-r from-cyan-500 to-blue-500 px-8 py-3 text-sm font-semibold text-white hover:from-cyan-400 hover:to-blue-400 transition-all duration-200 shadow-lg hover:shadow-cyan-500/25"
          >
            Explore Guides →
          </Link>
        </div>
      </section>

      <section className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} CleanGuy Tech — Technology for everyone.</p>
          <p className="mt-2 text-xs text-slate-500">Built with integrity, service, and faith.</p>
        </div>
      </section>
    </main>
  );
}
