import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const AdminGalleryCleanup = () => {
  const { isAdmin } = useAuth();
  const [status, setStatus] = useState<string>("Starting cleanup...");

  useEffect(() => {
    const run = async () => {
      if (!isAdmin) {
        setStatus("Access denied: admin only");
        return;
      }
      try {
        setStatus("Loading gallery items...");
        const { data, error } = await supabase.from('gallery').select('id,image_url');
        if (error) throw error;
        const items = data || [];
        setStatus(`Found ${items.length} items. Removing storage objects...`);
        const marker = "/storage/v1/object/public/gallery/";
        const paths: string[] = [];
        for (const i of items) {
          if (i.image_url && i.image_url.includes(marker)) {
            const p = i.image_url.split(marker)[1];
            if (p) paths.push(p);
          }
        }
        if (paths.length) {
          await supabase.storage.from('gallery').remove(paths);
        }
        setStatus("Deleting database rows...");
        const { error: delErr } = await supabase.from('gallery').delete().neq('id','');
        if (delErr) throw delErr;
        setStatus("Cleanup complete. You can close this page.");
      } catch (e) {
        console.error(e);
        setStatus("Cleanup failed. Check console/logs.");
      }
    };
    run();
  }, [isAdmin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-sm text-muted-foreground">{status}</div>
    </div>
  );
};

export default AdminGalleryCleanup;






