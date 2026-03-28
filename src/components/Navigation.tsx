"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Home as HouseIcon, 
  ShoppingBag, 
  Smartphone, 
  Headphones, 
  Watch, 
  Briefcase, 
  Zap,
  User,
  LifeBuoy,
  FileText
} from "lucide-react";

const NAV_LINKS = [
  { name: 'Home',         href: '/',            icon: HouseIcon },
  { name: 'Shop All',     href: '/products',    icon: ShoppingBag },
  { name: 'Phones',       href: '/phones',      icon: Smartphone },
  { name: 'Audio',        href: '/audio',       icon: Headphones },
  { name: 'Watches',      href: '/watches',     icon: Watch },
  { name: 'Accessories',  href: '/accessories', icon: Briefcase },
  { name: 'CMF',          href: '/cmf',         icon: Zap },
];

const FOOTER_LINKS = [
  { name: 'Account', href: '/account', icon: User },
  { name: 'Support', href: '/support', icon: LifeBuoy },
  { name: 'Legal',   href: '/legal',   icon: FileText },
];

const backdropVariants = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } },
};

const panelVariants = {
  hidden:  { x: '-100%' },
  visible: { x: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const listVariants = {
  hidden:  { transition: { staggerChildren: 0.03, staggerDirection: -1 } },
  visible: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
};

const itemVariants = {
  hidden:  { opacity: 0, x: -10 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
};

interface NavigationProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Navigation({ isOpen, onClose }: NavigationProps) {
  const pathname = usePathname();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            variants={backdropVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-white/60 backdrop-blur-sm cursor-pointer"
          />

          <motion.div
            variants={panelVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-y-0 left-0 z-[100] flex w-full md:w-[480px] flex-col bg-white border-r border-black/5"
          >
            {/* Header */}
            <div className="flex items-center justify-end px-6 py-[18px]">
              <button
                onClick={onClose}
                aria-label="Close menu"
                className="p-2 hover:opacity-40 transition-opacity active:scale-95 text-black"
              >
                <X size={24} strokeWidth={1} />
              </button>
            </div>

            {/* Main Links */}
            <motion.div
              variants={listVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-start justify-center flex-grow pl-10 md:pl-20 space-y-2"
            >
              {NAV_LINKS.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;

                return (
                  <motion.div key={link.name} variants={itemVariants}>
                    <Link
                      href={link.href}
                      onClick={onClose}
                      className="group relative flex items-center py-2 gap-4"
                    >
                      <Icon 
                        size={32} 
                        strokeWidth={1} 
                        className={`transition-colors duration-500 ${isActive ? 'text-[#ff0000]' : 'text-black/10 group-hover:text-black'}`} 
                      />
                      
                      <span
                        className={`font-ndotCaps text-4xl sm:text-5xl md:text-5xl transition-all duration-500
                          ${isActive
                            ? 'text-black tracking-tight'
                            : 'text-black/10 tracking-tight group-hover:text-black'
                          }`}
                      >
                        {link.name}
                      </span>

                      {isActive && (
                        <motion.div
                          layoutId="nav-pill"
                          className="h-1.5 w-1.5 rounded-full bg-[#ff0000]"
                        />
                      )}
                    </Link>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Footer */}
            <div className="p-10 flex flex-col gap-8 border-t border-black/5">
              <div className="flex gap-8">
                {FOOTER_LINKS.map((item) => {
                  const FooterIcon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={onClose}
                      className="group flex items-center gap-2 font-ntypeMono text-[10px] uppercase tracking-widest text-black/40 hover:text-black transition-colors"
                    >
                      <FooterIcon size={14} strokeWidth={1.5} />
                      {item.name}
                    </Link>
                  );
                })}
              </div>
              <p className="font-ntypeMono text-[10px] text-black/20 uppercase tracking-[0.3em]">
                © REWIRED SYSTEMS // Nothing Technology Limited
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}