import { useState } from 'react';
import { useApp } from '@/contexts/AppContext';
import ProgressBar from '@/components/ProgressBar';
import DonationModal from '@/components/DonationModal';
import { toast } from 'sonner';
import { Utensils, Info } from 'lucide-react';

const kgOptions = [1, 5, 10, 20];

const FoodPage = () => {
  const { food, addFoodDonation } = useApp();
  const [selectedKg, setSelectedKg] = useState(5);
  const [customKg, setCustomKg] = useState('');
  const [showModal, setShowModal] = useState(false);

  const kg = customKg ? parseInt(customKg) : selectedKg;
  const amount = kg * food.pricePerKg;
  const percent = Math.min(Math.round((food.raisedKg / food.goalKg) * 100), 100);

  const handleDonationSuccess = (name: string, donatedAmount: number) => {
    addFoodDonation(kg, name, '');
    setShowModal(false);
    setCustomKg('');
    toast.success(`💚 ${name} doou ${kg}kg de ração!`, { duration: 4000 });
  };

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-primary px-4 pb-8 pt-8">
        <div className="mx-auto max-w-lg">
          <h1 className="text-2xl font-extrabold text-primary-foreground">Ajude com ração 🥣</h1>
          <p className="mt-1 text-sm text-primary-foreground/80">Cada quilo faz a diferença</p>

          {/* Progress inside header */}
          <div className="mt-4 rounded-2xl bg-primary-foreground/15 p-4 backdrop-blur-sm">
            <div className="flex items-center justify-between text-primary-foreground mb-2">
              <span className="text-sm font-bold">{food.raisedKg}kg arrecadados</span>
              <span className="text-sm font-medium">{percent}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-primary-foreground/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-primary-foreground transition-all duration-700"
                style={{ width: `${percent}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-primary-foreground/70">
              <span>Meta: {food.goalKg}kg</span>
              <span>{food.donors} doadores</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 -mt-4">
        {/* How it works */}
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm animate-slide-up mb-5">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-primary" />
            <span className="text-sm font-bold text-foreground">Como funciona?</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            R${food.pricePerKg} = 1kg de ração. Escolha a quantidade abaixo e sua doação será convertida automaticamente em ração para os cães resgatados.
          </p>
        </div>

        {/* Quick selection - bigger buttons */}
        <h2 className="text-lg font-bold text-foreground mb-3">Quanto quer doar?</h2>
        <div className="grid grid-cols-2 gap-3">
          {kgOptions.map(k => (
            <button
              key={k}
              onClick={() => { setSelectedKg(k); setCustomKg(''); }}
              className={`rounded-2xl border p-4 text-center transition-all ${
                selectedKg === k && !customKg
                  ? 'border-primary bg-primary text-primary-foreground scale-[1.02] shadow-md'
                  : 'border-border bg-card text-foreground hover:border-primary hover:shadow-sm'
              }`}
            >
              <Utensils size={20} className="mx-auto mb-1 opacity-70" />
              <span className="block text-xl font-extrabold">{k}kg</span>
              <span className="text-xs opacity-80">R${k * food.pricePerKg}</span>
            </button>
          ))}
        </div>

        {/* Custom */}
        <input
          type="number"
          placeholder="Outra quantidade (kg)"
          value={customKg}
          onChange={e => setCustomKg(e.target.value)}
          className="mt-4 w-full rounded-xl border border-input bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {kg > 0 && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            {kg}kg = <span className="font-bold text-primary">R${amount}</span>
          </p>
        )}

        <button
          onClick={() => kg > 0 && setShowModal(true)}
          className="mt-4 w-full rounded-xl bg-primary py-4 text-lg font-bold text-primary-foreground shadow-lg transition-transform active:scale-[0.98] hover:opacity-90"
        >
          Doar {kg}kg de Ração 🥣
        </button>
      </div>

      <DonationModal
        open={showModal}
        onClose={() => setShowModal(false)}
        amount={amount}
        campaignName="Ração"
        onSuccess={handleDonationSuccess}
      />
    </div>
  );
};

export default FoodPage;
