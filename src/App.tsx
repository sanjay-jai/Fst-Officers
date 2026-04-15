import { useState, useEffect, useMemo } from 'react';
import { Search, Phone, User, MapPin, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Officer, TALUKS } from './types';
import { fetchSheetData } from './services/sheetService';

export default function App() {
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTaluk, setSelectedTaluk] = useState<string>('');
  const [displayedTaluk, setDisplayedTaluk] = useState<string>('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async (showRefresh = false) => {
    if (showRefresh) setIsRefreshing(true);
    else setLoading(true);
    
    setError(null);
    try {
      const data = await fetchSheetData();
      setOfficers(data);
    } catch (err) {
      setError('Failed to load data from Google Sheets. Please ensure the sheet is public or check your connection.');
      console.error(err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSearch = () => {
    setDisplayedTaluk(selectedTaluk);
  };

  const filteredOfficers = useMemo(() => {
    return officers.filter(officer => {
      if (!displayedTaluk) return true;
      const searchKey = displayedTaluk.toLowerCase();
      const officerTaluk = officer.taluk.toLowerCase();
      return officerTaluk.includes(searchKey) || searchKey.includes(officerTaluk);
    });
  }, [officers, displayedTaluk]);

  return (
    <div className="min-h-screen bg-[#F0F2F5] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Header */}
      <header className="vibrant-gradient sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-md p-2.5 rounded-2xl border border-white/30 shadow-inner">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white leading-none">
                Assembly Constituency
              </h1>
            </div>
          </div>
          <button 
            onClick={() => loadData(true)}
            disabled={loading || isRefreshing}
            className="p-3 text-white/90 hover:text-white hover:bg-white/10 rounded-2xl transition-all disabled:opacity-50 group"
            title="Refresh Data"
          >
            <RefreshCw className={`w-6 h-6 ${isRefreshing ? 'animate-spin' : 'group-hover:rotate-180 transition-transform duration-500'}`} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Controls Card */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-indigo-50 p-10 mb-12 relative overflow-hidden"
        >
          {/* Decorative background element */}
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-50 rounded-full blur-3xl opacity-50" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-pink-50 rounded-full blur-3xl opacity-50" />

          <div className="max-w-xl mx-auto space-y-8 relative z-10">
            <div className="text-center space-y-2">
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Search Officers</h2>
              <p className="text-slate-500 font-medium">Select a constituency to view the assigned team</p>
            </div>

            <div className="space-y-4">
              <label htmlFor="taluk-select" className="text-xs font-black text-indigo-600 uppercase tracking-widest flex items-center gap-2 ml-1">
                <MapPin className="w-4 h-4" />
                Select Constituency
              </label>
              <div className="relative group">
                <select
                  id="taluk-select"
                  value={selectedTaluk}
                  onChange={(e) => setSelectedTaluk(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-slate-100 text-slate-900 text-lg font-bold rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 block p-5 transition-all outline-none appearance-none cursor-pointer hover:border-indigo-200"
                  style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'3\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 1.5rem center', backgroundSize: '1.2em' }}
                >
                  <option value="">All Constituencies</option>
                  {TALUKS.map(taluk => (
                    <option key={taluk} value={taluk}>{taluk}</option>
                  ))}
                </select>
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="vibrant-button w-full vibrant-gradient text-white font-black text-lg py-5 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-indigo-200"
            >
              <Search className="w-6 h-6" />
              SEARCH NOW
            </button>
          </div>
        </motion.div>

        {/* Status Messages */}
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-24 gap-6"
            >
              <div className="relative">
                <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
              <p className="text-indigo-900 font-black text-xl tracking-tight">Syncing Live Data...</p>
            </motion.div>
          ) : error ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white border-2 border-red-100 rounded-[2.5rem] p-12 text-center shadow-2xl shadow-red-100/50"
            >
              <div className="bg-red-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-3 tracking-tight">Connection Lost</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto font-medium leading-relaxed">{error}</p>
              <button 
                onClick={() => loadData()}
                className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black hover:bg-slate-800 transition-all active:scale-95 shadow-xl"
              >
                RETRY CONNECTION
              </button>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between px-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-indigo-600 rounded-full" />
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                    {displayedTaluk || 'All Officers'} 
                  </h2>
                </div>
                <span className="bg-indigo-100 text-indigo-700 font-black px-4 py-2 rounded-xl text-sm">
                  {filteredOfficers.length} OFFICERS
                </span>
              </div>

              {filteredOfficers.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOfficers.map((officer, index) => (
                    <motion.div
                      key={`${officer.name}-${index}`}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05, type: "spring", stiffness: 100 }}
                      className="bg-white rounded-[2rem] border border-slate-100 p-7 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all group relative overflow-hidden"
                    >
                      {/* Colorful accent bar */}
                      <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                      <div className="flex items-start justify-between mb-6">
                        <div className="bg-slate-50 p-4 rounded-2xl group-hover:bg-indigo-50 transition-colors duration-300">
                          <User className="w-7 h-7 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg">
                            {officer.taluk.split('-')[0]}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-8">
                        <h3 className="font-black text-slate-900 text-xl leading-tight group-hover:text-indigo-600 transition-colors">
                          {officer.name}
                        </h3>
                        <div className="flex items-center gap-2 text-slate-400 font-bold text-sm">
                          <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                          {officer.designation}
                        </div>
                      </div>

                      <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Mobile Number</span>
                          <div className="flex items-center gap-2 text-slate-900">
                            <Phone className="w-4 h-4 text-indigo-500" />
                            <span className="text-lg font-mono font-black tracking-tighter">{officer.mobile}</span>
                          </div>
                        </div>
                        <a 
                          href={`tel:${officer.mobile}`}
                          className="bg-emerald-500 text-white p-4 rounded-2xl hover:bg-emerald-600 hover:scale-110 active:scale-90 transition-all shadow-lg shadow-emerald-100"
                        >
                          <Phone className="w-5 h-5 fill-current" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-[2.5rem] border-4 border-dashed border-slate-100 p-24 text-center">
                  <div className="bg-slate-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Search className="w-10 h-10 text-slate-200" />
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No Results Found</h3>
                  <p className="text-slate-400 font-medium max-w-xs mx-auto">Select a constituency above and click the search button to see the team.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>


      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-gray-400 text-xs">
        <p>© 2026 Election Monitoring System • Data synced from Google Sheets</p>
      </footer>
    </div>
  );
}
