"""
Servicio de envío de emails para usuarios
"""
from django.core.mail import send_mail
from django.conf import settings
import os


def enviar_email_bienvenida(user):
    """
    Envía un email de bienvenida al usuario recién registrado

    Args:
        user: Instancia del modelo User
    """
    frontend_url = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Asunto del email
    asunto = '¡Bienvenido a RM Salud! 🌟'

    # Nombre del usuario o username como fallback
    nombre = user.first_name if user.first_name else user.username

    # Mensaje HTML
    html_message = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #14b8a6 0%, #0d9488 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }}
            .content {{
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
            }}
            .welcome-box {{
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #14b8a6;
            }}
            .features {{
                display: grid;
                gap: 15px;
                margin: 20px 0;
            }}
            .feature {{
                background: white;
                padding: 15px;
                border-radius: 8px;
                display: flex;
                align-items: center;
            }}
            .feature-icon {{
                font-size: 32px;
                margin-right: 15px;
            }}
            .button {{
                display: inline-block;
                background: #14b8a6;
                color: white;
                padding: 12px 30px;
                text-decoration: none;
                border-radius: 8px;
                margin: 20px 0;
                font-weight: bold;
            }}
            .footer {{
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
            }}
        </style>
    </head>
    <body>
        <div class="header">
            <h1>¡Bienvenido a RM Salud!</h1>
            <p>Tu camino hacia una vida más saludable comienza aquí</p>
        </div>

        <div class="content">
            <div class="welcome-box">
                <h2>¡Hola, {nombre}! 👋</h2>
                <p>
                    Estamos emocionados de tenerte como parte de nuestra comunidad.
                    RM Salud es tu compañero personal para alcanzar tus objetivos de salud y bienestar.
                </p>
            </div>

            <h3>¿Qué puedes hacer en RM Salud?</h3>

            <div class="features">
                <div class="feature">
                    <div class="feature-icon">🏃</div>
                    <div>
                        <strong>Registra tus actividades</strong><br>
                        <small>Monitorea tu ejercicio diario y calorías quemadas</small>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">🍽️</div>
                    <div>
                        <strong>Controla tu alimentación</strong><br>
                        <small>Lleva un registro detallado de tus comidas y calorías</small>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">📊</div>
                    <div>
                        <strong>Visualiza tu progreso</strong><br>
                        <small>Observa tus estadísticas y logros en tiempo real</small>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">🎯</div>
                    <div>
                        <strong>Recibe recomendaciones</strong><br>
                        <small>Obtén consejos personalizados para tu salud</small>
                    </div>
                </div>

                <div class="feature">
                    <div class="feature-icon">🎉</div>
                    <div>
                        <strong>Descubre eventos</strong><br>
                        <small>Explora eventos de salud y bienestar cerca de ti</small>
                    </div>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{frontend_url}/login" class="button">
                    🚀 Comenzar Ahora
                </a>
            </div>

            <div class="welcome-box" style="margin-top: 30px;">
                <h3>Primeros pasos recomendados:</h3>
                <ol style="padding-left: 20px;">
                    <li>Completa tu perfil con tus datos (edad, peso, altura)</li>
                    <li>Registra tu primera actividad del día</li>
                    <li>Añade tus comidas para comenzar a monitorear tu nutrición</li>
                    <li>Explora eventos de bienestar en tu zona</li>
                </ol>
            </div>

            <div class="footer">
                <p>
                    <strong>¿Necesitas ayuda?</strong><br>
                    Estamos aquí para apoyarte en tu viaje de salud.
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    # Mensaje de texto plano (fallback)
    mensaje_texto = f"""
¡Bienvenido a RM Salud, {nombre}!

Estamos emocionados de tenerte como parte de nuestra comunidad.

¿Qué puedes hacer en RM Salud?

🏃 Registra tus actividades
   Monitorea tu ejercicio diario y calorías quemadas

🍽️ Controla tu alimentación
   Lleva un registro detallado de tus comidas y calorías

📊 Visualiza tu progreso
   Observa tus estadísticas y logros en tiempo real

🎯 Recibe recomendaciones
   Obtén consejos personalizados para tu salud

🎉 Descubre eventos
   Explora eventos de salud y bienestar cerca de ti

Primeros pasos recomendados:
1. Completa tu perfil con tus datos (edad, peso, altura)
2. Registra tu primera actividad del día
3. Añade tus comidas para comenzar a monitorear tu nutrición
4. Explora eventos de bienestar en tu zona

Comienza ahora: {frontend_url}/login

¿Necesitas ayuda? Estamos aquí para apoyarte en tu viaje de salud.

¡Saludos cordiales!
El equipo de RM Salud
    """

    # Enviar email
    send_mail(
        subject=asunto,
        message=mensaje_texto,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[user.email],
        html_message=html_message,
        fail_silently=False,
    )
