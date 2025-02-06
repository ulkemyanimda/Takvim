from datetime import datetime
import tkinter as tk
from tkinter import ttk, messagebox
import json
import os

class TarihTakip:
    def __init__(self):
        self.pencere = tk.Tk()
        self.pencere.title("Tarih Takip Programı")
        self.pencere.geometry("400x500")
        
        # Stil ayarları
        style = ttk.Style()
        style.configure("TButton", padding=5)
        style.configure("TLabel", padding=5)
        
        # Tarih girişi
        self.tarih_frame = ttk.LabelFrame(self.pencere, text="Yeni Hedef Tarih Ekle", padding=10)
        self.tarih_frame.pack(fill="x", padx=10, pady=5)
        
        ttk.Label(self.tarih_frame, text="Hedef Adı:").pack()
        self.hedef_adi = ttk.Entry(self.tarih_frame)
        self.hedef_adi.pack(fill="x")
        
        ttk.Label(self.tarih_frame, text="Tarih (GG.AA.YYYY):").pack()
        self.tarih_girisi = ttk.Entry(self.tarih_frame)
        self.tarih_girisi.pack(fill="x")
        
        ttk.Button(self.tarih_frame, text="Ekle", command=self.hedef_ekle).pack(pady=5)
        
        # Hedefler listesi
        self.liste_frame = ttk.LabelFrame(self.pencere, text="Hedefler", padding=10)
        self.liste_frame.pack(fill="both", expand=True, padx=10, pady=5)
        
        # Hedefleri göster
        self.hedefler_text = tk.Text(self.liste_frame, height=15, width=40)
        self.hedefler_text.pack(fill="both", expand=True)
        
        # Güncelleme butonu
        ttk.Button(self.pencere, text="Hedefleri Güncelle", command=self.hedefleri_goster).pack(pady=5)
        
        # Hedefleri yükle
        self.hedefler = self.hedefleri_yukle()
        self.hedefleri_goster()
        
        # Otomatik güncelleme
        self.pencere.after(60000, self.otomatik_guncelle)  # Her dakika güncelle
        
    def hedef_ekle(self):
        hedef = self.hedef_adi.get().strip()
        tarih_str = self.tarih_girisi.get().strip()
        
        if not hedef or not tarih_str:
            messagebox.showerror("Hata", "Lütfen hedef adı ve tarih giriniz!")
            return
            
        try:
            tarih = datetime.strptime(tarih_str, "%d.%m.%Y")
            self.hedefler[hedef] = tarih_str
            self.hedefleri_kaydet()
            self.hedefleri_goster()
            self.hedef_adi.delete(0, tk.END)
            self.tarih_girisi.delete(0, tk.END)
            messagebox.showinfo("Başarılı", "Hedef başarıyla eklendi!")
        except ValueError:
            messagebox.showerror("Hata", "Geçersiz tarih formatı! Lütfen GG.AA.YYYY formatında giriniz.")
    
    def kalan_sure_hesapla(self, tarih_str):
        hedef_tarih = datetime.strptime(tarih_str, "%d.%m.%Y")
        simdi = datetime.now()
        fark = hedef_tarih - simdi
        
        if fark.total_seconds() <= 0:
            return "Tarih geçti!"
        
        gun = fark.days
        saat = fark.seconds // 3600
        dakika = (fark.seconds % 3600) // 60
        
        return f"{gun} gün, {saat} saat, {dakika} dakika"
    
    def hedefleri_goster(self):
        self.hedefler_text.delete(1.0, tk.END)
        if not self.hedefler:
            self.hedefler_text.insert(tk.END, "Henüz hedef eklenmemiş!")
            return
            
        for hedef, tarih in sorted(self.hedefler.items()):
            kalan = self.kalan_sure_hesapla(tarih)
            self.hedefler_text.insert(tk.END, f"🎯 {hedef}\n")
            self.hedefler_text.insert(tk.END, f"📅 Hedef Tarih: {tarih}\n")
            self.hedefler_text.insert(tk.END, f"⏳ Kalan Süre: {kalan}\n")
            self.hedefler_text.insert(tk.END, "-" * 40 + "\n")
    
    def hedefleri_kaydet(self):
        with open("hedefler.json", "w", encoding="utf-8") as f:
            json.dump(self.hedefler, f, ensure_ascii=False, indent=2)
    
    def hedefleri_yukle(self):
        try:
            with open("hedefler.json", "r", encoding="utf-8") as f:
                return json.load(f)
        except FileNotFoundError:
            return {}
    
    def otomatik_guncelle(self):
        self.hedefleri_goster()
        self.pencere.after(60000, self.otomatik_guncelle)  # Her dakika güncelle
    
    def baslat(self):
        self.pencere.mainloop()

if __name__ == "__main__":
    uygulama = TarihTakip()
    uygulama.baslat()
