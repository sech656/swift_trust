import AdminSettings from '@/models/AdminSettings';
import User from '@/models/User';

export async function getAdminSettingsForUser(userId: number, keys: string[]) {
  const user = await User.findByPk(userId);
  if (!user) return null;

  const referrerId = user.referredById;
  
  // If user has a referrer, check if they have custom settings allowed
  if (referrerId) {
    const referrer = await User.findByPk(referrerId);
    if (referrer && referrer.allowCustomSettings) {
      const customSettings = await AdminSettings.findAll({
        where: {
          key: keys,
          userId: referrerId
        }
      });
      
      // If all requested keys are found in custom settings, return them
      if (customSettings.length === keys.length) {
        return customSettings;
      }
      
      // Otherwise, fetch global settings and merge
      const globalSettings = await AdminSettings.findAll({
        where: {
          key: keys,
          userId: null
        }
      });
      
      const settingsMap = new Map();
      globalSettings.forEach(s => settingsMap.set(s.key, s.value));
      customSettings.forEach(s => settingsMap.set(s.key, s.value));
      
      return Array.from(settingsMap.entries()).map(([key, value]) => ({ key, value }));
    }
  }

  // Default: return global settings
  return await AdminSettings.findAll({
    where: {
      key: keys,
      userId: null
    }
  });
}

export async function getAdminSettingForUser(userId: number, key: string) {
  const settings = await getAdminSettingsForUser(userId, [key]);
  return settings?.find(s => s.key === key)?.value;
}
