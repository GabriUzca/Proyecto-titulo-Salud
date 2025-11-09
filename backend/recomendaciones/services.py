from datetime import date, timedelta

# Datos mock de recursos locales en la RM
DATA = [
    {
        "titulo": "Parque Bicentenario",
        "lugar": "Vitacura",
        "lat": -33.4006,
        "lng": -70.6075,
        "fecha": 1,
        "tipo": "parque"
    },
    {
        "titulo": "Ciclovía Providencia",
        "lugar": "Providencia",
        "lat": -33.4251,
        "lng": -70.6159,
        "fecha": 3,
        "tipo": "ciclovia"
    },
    {
        "titulo": "Feria Saludable Las Condes",
        "lugar": "Las Condes",
        "lat": -33.4172,
        "lng": -70.5926,
        "fecha": 7,
        "tipo": "feria"
    },
    {
        "titulo": "Gimnasio Municipal Ñuñoa",
        "lugar": "Ñuñoa",
        "lat": -33.4569,
        "lng": -70.5970,
        "fecha": 0,
        "tipo": "gimnasio"
    },
]

def recomendaciones_locales(comuna="Santiago"):
    """
    Retorna recomendaciones de recursos locales en la RM.
    En el futuro, esto podría filtrarse por comuna o integrar APIs externas.
    """
    hoy = date.today()
    items = []
    
    for it in DATA:
        items.append({
            "titulo": it["titulo"],
            "lugar": it["lugar"],
            "lat": it["lat"],
            "lng": it["lng"],
            "fecha": str(hoy + timedelta(days=it["fecha"])),
            "tipo": it.get("tipo", "otro")
        })
    
    return items