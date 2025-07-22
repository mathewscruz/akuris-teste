import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/AuthProvider';

const UserProfile: React.FC = () => {
  const { user, profile } = useAuth();

  if (!user || !profile) {
    return null;
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      case 'user':
        return 'secondary';
      case 'readonly':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      case 'readonly':
        return 'Somente Leitura';
      default:
        return role;
    }
  };

  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-8 w-8">
        <AvatarImage src={user.user_metadata?.avatar_url} />
        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
          {getInitials(profile.nome)}
        </AvatarFallback>
      </Avatar>
      
      <div className="hidden sm:block">
        <p className="text-sm font-medium text-foreground">{profile.nome}</p>
        <Badge variant={getRoleColor(profile.role)} className="text-xs">
          {getRoleLabel(profile.role)}
        </Badge>
      </div>
    </div>
  );
};

export default UserProfile;