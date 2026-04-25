import React from 'react';
import { useAuth } from '../context/AuthContext';

const MeaningTable = ({ wordByWord }) => {
  const { currentLang } = useAuth();
  const isTe = currentLang === 'te';

  if (!wordByWord || wordByWord.length === 0) return null;

  return (
    <div className="overflow-hidden rounded-xl border border-lem-glass-border shadow-sm mt-6">
      <table className="min-w-full divide-y divide-lem-glass-border">
        <thead className="bg-lem-sidebar">
          <tr>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
              {isTe ? "పదం" : "Word"}
            </th>
            <th scope="col" className="px-4 py-3 text-left text-sm font-bold text-lem-accent uppercase tracking-wider">
              {isTe ? "అర్థం" : "Meaning"}
            </th>
          </tr>
        </thead>
        <tbody className="bg-white/5 divide-y divide-white/5">
          {wordByWord.map((item, index) => {
            const word = isTe && item.sanskrit_te ? item.sanskrit_te : item.sanskrit || item.word;
            const meaning = isTe && item.te ? item.te : item.en || item.meaning;

            return (
              <tr key={index} className="hover:bg-white/10 transition-colors">
                <td className="px-4 py-3 text-sm font-medium text-white whitespace-nowrap">
                  {word}
                </td>
                <td className="px-4 py-3 text-sm text-gray-300">
                  {meaning}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default MeaningTable;
