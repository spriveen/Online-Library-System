import React, { useState } from 'react'
import {sidebarStyles as s} from '../assets/dummyStyles';
import {BookCopy, ChartNoAxesCombined, ChevronRight, Menu, ShieldCheck, UserRound, X} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const iconMap = {
    dashboard: ChartNoAxesCombined,
    books: BookCopy,
    alerts: Bell,
    admin:  ShieldCheck,
    users: UserRound,
};

const Sidebar = (
    title,
    subtitle,
    badge,
    navItems = [],
    accent = "user",
    logoSrc
) => {

  const location = useLocation();
  const [open, setOpen] = useState(false);

  const badgeStyles = account === "admin" ? s.badgeAdmin : s.badgeUser;

  return (
    <>
      <button type='button' onClick={()=> setOpen(true)}
        className={s.mobileMenuButton}
        >
            <Menu size={18} />
            </button>

            <div className={`${s.mobileOverlay} ${
                open ? s.mobileOverlayOpen : s.mobileOverlayClosed
            }`} onClick={()=> setOpen (false)}
            />
         <aside 
         className={`${s.sidebar} ${open ? s.sidebarOpen : s.sidebarClosed}`}
         >
            <div className={s.sidebarHeader}>
            <div className='min-w-0 pr-3'>
              <div className={s.logoWrapper}>
                {logoSrc ? (
                    <img src={logoSrc} alt='logo' className={s.logoImage} />
                ): (
                    <BookCopy size={22} />
                )}
              </div>
              <h2 className={s.title}>{title}</h2>
              <p className={s.subtitle}>{subtitle}</p>
              {badge  && ( 
                <span className={`${s.badgeBase} ${badgeStyles}`}>{badge}</span>
              )}
            </div>
           <button onClick={()=> setOpen(false)} type='button'
            className={s.closeButton} 
            >
              <X size={18} />
           </button>
           </div>

           <nav className={s.nav}>
              {navItems.map((item) => {
                const Icon = iconMap[item.icon] ?? ChevronRight;
                const active = 
                location.pathname === item.href ||
                (item.match ? location.pathname.startsWith(item.match):false);

                return (
                    <Link key={item.label} to={item.href} onClick={()=> setOpen(false)}
                    className={`${s.navLink} ${
                      active ?  s.navLinkActive : s.navLinkInactive
                    }`}
                    >
                     <span>
                        
                     </span>
                    </Link>
                )
              })}
           </nav>
           </aside>
           </>
           );
        };

export default Sidebar
