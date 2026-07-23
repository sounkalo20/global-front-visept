'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  User, Shield, Lock, Building2, Calendar, Phone, Mail, ChevronLeft, Save, CheckCircle2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import useAuthStore from '@/store/authStore';
import useCompanyStore from '@/store/companyStore';
import { authApi } from '@/lib/api/auth';
import { getBasePath } from '@/lib/config/navigation';

const profileSchema = z.object({
  first_name: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  last_name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  phone: z.string().optional().nullable()
});

const passwordSchema = z.object({
  current_password: z.string().min(1, "L'ancien mot de passe est requis"),
  new_password: z.string().min(8, "Le nouveau mot de passe doit contenir au moins 8 caractères"),
  confirm_password: z.string().min(1, "La confirmation est requise")
}).refine((data) => data.new_password === data.confirm_password, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirm_password"]
});

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, isSuperAdmin } = useAuthStore();
  const { activeCompany } = useCompanyStore();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: user?.first_name || '',
      last_name: user?.last_name || '',
      phone: user?.phone || ''
    }
  });

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      current_password: '',
      new_password: '',
      confirm_password: ''
    }
  });

  const handleProfileSubmit = async (data) => {
    setIsUpdatingProfile(true);
    try {
      const response = await authApi.updateProfile(data);
      setUser(response.data.user);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordSubmit = async (data) => {
    setIsUpdatingPassword(true);
    try {
      await authApi.updatePassword({
        current_password: data.current_password,
        new_password: data.new_password
      });
      toast.success("Mot de passe mis à jour avec succès");
      passwordForm.reset();
    } catch (error) {
      toast.error(error.response?.data?.message || "Erreur lors de la mise à jour");
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleBack = () => {
    if (isSuperAdmin) {
      router.push('/super_admin/dashboard');
    } else if (activeCompany) {
      const base = getBasePath(activeCompany.business_type?.code || 'SHOP');
      if (activeCompany.my_role === 'cashier') {
        router.push(`${base}/sales/new`);
      } else {
        router.push(`${base}/dashboard`);
      }
    } else {
      router.push('/companies');
    }
  };

  if (!user) return null;

  const initials = `${user.first_name?.charAt(0) || ''}${user.last_name?.charAt(0) || ''}`.toUpperCase();
  const creationDate = user.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric'
  }) : 'Non défini';

  let roleLabel = 'Utilisateur';
  let roleColor = 'bg-stone-100 text-stone-700';

  if (isSuperAdmin) {
    roleLabel = 'Super Administrateur';
    roleColor = 'bg-amber-100 text-amber-700';
  } else if (activeCompany) {
    const role = activeCompany.my_role;
    if (role === 'owner') {
      roleLabel = 'Propriétaire';
      roleColor = 'bg-brand-100 text-brand-700';
    } else if (role === 'manager') {
      roleLabel = 'Gérant';
      roleColor = 'bg-blue-100 text-blue-700';
    } else if (role === 'cashier') {
      roleLabel = 'Caissier';
      roleColor = 'bg-emerald-100 text-emerald-700';
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={handleBack} className="text-stone-500 hover:text-stone-900">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Retour à l'application
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl p-4 sm:p-6 lg:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-stone-900">Mon Profil</h1>
            <p className="text-sm text-stone-500">Gérez vos informations personnelles et paramètres de sécurité.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          
          <div className="space-y-6">
            {/* Informations Personnelles */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="border-b border-stone-100 p-5">
                <div className="flex items-center gap-2 font-medium text-stone-900">
                  <User className="h-5 w-5 text-brand-600" />
                  Informations personnelles
                </div>
              </div>
              <div className="p-5">
                <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Prénom</label>
                      <Input {...profileForm.register('first_name')} />
                      {profileForm.formState.errors.first_name && (
                        <p className="text-xs text-red-500">{profileForm.formState.errors.first_name.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Nom</label>
                      <Input {...profileForm.register('last_name')} />
                      {profileForm.formState.errors.last_name && (
                        <p className="text-xs text-red-500">{profileForm.formState.errors.last_name.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Email</label>
                      <Input value={user.email} disabled className="bg-stone-50" />
                      <p className="text-xs text-stone-500">L'adresse email ne peut pas être modifiée.</p>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Téléphone</label>
                      <Input {...profileForm.register('phone')} placeholder="+33 6 12 34 56 78" />
                      {profileForm.formState.errors.phone && (
                        <p className="text-xs text-red-500">{profileForm.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isUpdatingProfile}>
                      {isUpdatingProfile ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Save className="mr-2 h-4 w-4" />
                          Enregistrer les modifications
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>

            {/* Sécurité */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="border-b border-stone-100 p-5">
                <div className="flex items-center gap-2 font-medium text-stone-900">
                  <Lock className="h-5 w-5 text-amber-500" />
                  Sécurité et mot de passe
                </div>
              </div>
              <div className="p-5">
                <form onSubmit={passwordForm.handleSubmit(handlePasswordSubmit)} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium text-stone-700">Ancien mot de passe</label>
                    <Input type="password" {...passwordForm.register('current_password')} />
                    {passwordForm.formState.errors.current_password && (
                      <p className="text-xs text-red-500">{passwordForm.formState.errors.current_password.message}</p>
                    )}
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Nouveau mot de passe</label>
                      <Input type="password" {...passwordForm.register('new_password')} />
                      {passwordForm.formState.errors.new_password && (
                        <p className="text-xs text-red-500">{passwordForm.formState.errors.new_password.message}</p>
                      )}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-stone-700">Confirmation</label>
                      <Input type="password" {...passwordForm.register('confirm_password')} />
                      {passwordForm.formState.errors.confirm_password && (
                        <p className="text-xs text-red-500">{passwordForm.formState.errors.confirm_password.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={isUpdatingPassword} className="bg-stone-900 hover:bg-stone-800 text-white">
                      {isUpdatingPassword ? (
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Mettre à jour le mot de passe
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Profil */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="rounded-xl border border-stone-200 bg-white p-6 text-center shadow-sm"
            >
              <div className="mx-auto mb-4 flex justify-center">
                <Avatar className="h-24 w-24 ring-4 ring-stone-50">
                  <AvatarFallback className="text-2xl font-semibold bg-brand-100 text-brand-700">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <h3 className="text-lg font-bold text-stone-900">{user.first_name} {user.last_name}</h3>
              <div className={`${roleColor} mt-2 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-inset ring-black/5 justify-center w-max mx-auto gap-1.5`}>
                {isSuperAdmin ? <Shield className="h-3.5 w-3.5" /> : <User className="h-3.5 w-3.5" />}
                {roleLabel}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl border border-stone-200 bg-white shadow-sm"
            >
              <div className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <Mail className="mt-0.5 h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-xs font-medium text-stone-500">Adresse Email</p>
                    <p className="text-sm text-stone-900">{user.email}</p>
                  </div>
                </div>
                
                {user.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="mt-0.5 h-4 w-4 text-stone-400" />
                    <div>
                      <p className="text-xs font-medium text-stone-500">Téléphone</p>
                      <p className="text-sm text-stone-900">{user.phone}</p>
                    </div>
                  </div>
                )}

                {activeCompany && !isSuperAdmin && (
                  <div className="flex items-start gap-3">
                    <Building2 className="mt-0.5 h-4 w-4 text-stone-400" />
                    <div>
                      <p className="text-xs font-medium text-stone-500">Entreprise Actuelle</p>
                      <p className="text-sm font-medium text-brand-600">{activeCompany.name}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <Calendar className="mt-0.5 h-4 w-4 text-stone-400" />
                  <div>
                    <p className="text-xs font-medium text-stone-500">Membre depuis le</p>
                    <p className="text-sm text-stone-900">{creationDate}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </main>
    </div>
  );
}
