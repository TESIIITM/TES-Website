import React from 'react';

const teamData = {
  coordinators: [
    { name: "Dr. Rahul Kala", linkedin: "https://www.linkedin.com/in/rkala001/", image: "/team/Dr.RahulKala.jpeg" },
    { name: "Dr. Rohit Kumar", linkedin: "https://www.linkedin.com/in/dr-rohit-kumar-smieee/", image: "/team/Dr.RohitKumar.png" }
    
  ],
  team: [
    { name: "Mithul Nama", linkedin: "https://www.linkedin.com/in/mithul-nama-61362a331", image:   "/team/mithul.jpg" },
    { name: "Rohinth S", linkedin: "https://www.linkedin.com/in/srohinth/", image: "/team/rohinth.jpg"},
    { name: "Aman Dabral", linkedin: "https://www.linkedin.com/in/aman-dabral-163730323/", image: "" },
  ]
};

const Team = () => {
  return (
    <section className="py-12 px-6 max-w-6xl mx-auto space-y-12">
      
      {/* Section Header */}
      <div className="text-center space-y-2">
        <h2 className="text-[var(--color-text-main)] text-3xl md:text-4xl font-bold tracking-tight">
          The <span className="text-[var(--color-sapphire)]">Team</span>
        </h2>
      </div>

      {/* Core Team Section */}
      <div className="space-y-6">
        <h3 className="text-[var(--color-teal)] text-2xl md:text-3xl font-bold tracking-tight text-center">
          Core Members
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {teamData.team?.map((member, index) => (
            <a 
              key={index}
              href={member.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              /* ADDED items-center and removed block */
              className="group bg-[var(--color-surface)] border border-white/5 p-6 rounded-2xl hover:border-[var(--color-teal)]/50 transition-all flex flex-col items-center cursor-pointer"
            >
              <div className="w-20 h-20 bg-white/5 mb-6 flex items-center justify-center overflow-hidden relative rounded-full border border-white/5 group-hover:border-[var(--color-teal)]/30 transition-colors">
                {member.image ? (
                  <img src={member.image} alt={member.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className="text-[var(--color-text-muted)] font-black text-xl group-hover:text-[var(--color-teal)] transition-colors">
                    {member.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <p className="text-[var(--color-text-main)] text-xl font-semibold transition-colors group-hover:text-[var(--color-teal)] text-center">{member.name}</p>
              
              <div className="mt-auto pt-5 border-t border-white/5 w-full">
                <span className="text-sm font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-teal)] transition-colors flex items-center justify-center gap-2">
                  View Profile <span>→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Lead Coordinators Section - commented out
      <div className="space-y-6 pt-6 justify-center flex flex-col items-center rounded-2xl">
        <h3 className="text-[var(--color-lavender)] text-2xl md:text-3xl font-bold tracking-tight text-center">
          Coordinators
        </h3>
        <div className="flex flex-col sm:flex-row gap-6 w-full items-center justify-center ">
          {teamData.coordinators?.map((lead, index) => (
            <a 
              key={index} 
              href={lead.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-[var(--color-surface)] border border-white/5 p-6 rounded-2xl hover:border-[var(--color-sapphire)]/50 transition-all flex flex-col items-center cursor-pointer"
            >
              <div className="w-30 h-28 shrink-0 bg-white/5 mb-6 flex items-center justify-center overflow-hidden relative rounded-full border border-white/5 group-hover:border-[var(--color-sapphire)]/30 transition-colors">
                {lead.image ? (
                  <img src={lead.image} alt={lead.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                ) : (
                  <span className="text-[var(--color-text-muted)] font-black text-5xl group-hover:text-[var(--color-lavender)] transition-colors">
                    {lead.name.charAt(0)}
                  </span>
                )}
              </div>
              
              <p className="text-[var(--color-text-main)] text-xl font-semibold transition-colors group-hover:text-[var(--color-sapphire)] text-center">{lead.name}</p>
              
              <div className="mt-auto pt-5 border-t border-white/5 w-55">
                <span className="text-sm font-bold text-[var(--color-text-muted)] group-hover:text-[var(--color-lavender)] transition-colors flex items-center justify-center gap-2">
                  View Profile <span>→</span>
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
      */}

    </section>
  );
};

export default Team;