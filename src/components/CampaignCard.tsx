import { Link } from 'react-router-dom';
import { MapPin, Users } from 'lucide-react';
import type { Campaign } from '@/contexts/AppContext';
import ProgressBar from './ProgressBar';

const CampaignCard = ({ campaign }: { campaign: Campaign }) => {
  const { id, name, image, location, status, goal, raised, donors } = campaign;

  return (
    <Link
      to={`/vaquinhas/${id}`}
      className="block overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md animate-slide-up"
    >
      <div className="relative">
        <img src={image} alt={name} className="h-44 w-full object-cover" />
        <span
          className={`absolute right-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${
            status === 'Urgente'
              ? 'bg-destructive text-destructive-foreground'
              : 'bg-primary text-primary-foreground'
          }`}
        >
          {status}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold text-foreground">{name}</h3>
        <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin size={12} />
          <span>{location}</span>
        </div>
        <div className="mt-3">
          <ProgressBar current={raised} goal={goal} />
        </div>
        <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
          <Users size={12} />
          <span>{donors} doadores</span>
        </div>
      </div>
    </Link>
  );
};

export default CampaignCard;
