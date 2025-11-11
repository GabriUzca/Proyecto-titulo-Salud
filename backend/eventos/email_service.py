"""
Servicio para envío de emails relacionados con solicitudes de eventos
"""
import os
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.conf import settings


def enviar_email_confirmacion_solicitud(solicitud):
    """
    Envía email de confirmación al solicitante cuando crea una nueva solicitud

    Args:
        solicitud: Instancia del modelo EventRequest
    """
    asunto = f'📋 Solicitud Recibida - {solicitud.nombre_evento}'

    contexto = {
        'nombre_contacto': solicitud.nombre_contacto,
        'nombre_evento': solicitud.nombre_evento,
        'codigo_seguimiento': solicitud.codigo_seguimiento,
        'fecha_inicio': solicitud.fecha_inicio.strftime('%d de %B de %Y a las %H:%M'),
    }

    # Template HTML
    mensaje_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
            .codigo {{ background: #fff; border: 2px dashed #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }}
            .codigo-text {{ font-size: 32px; font-weight: bold; color: #4CAF50; letter-spacing: 2px; }}
            .info-box {{ background: #e3f2fd; padding: 15px; border-left: 4px solid #2196F3; margin: 15px 0; }}
            .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
            .button {{ display: inline-block; padding: 12px 30px; background: #4CAF50; color: white !important; text-decoration: none; border-radius: 5px; margin: 10px 0; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Solicitud Recibida</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{contexto['nombre_contacto']}</strong>,</p>

                <p>Hemos recibido tu solicitud para publicar el evento <strong>"{contexto['nombre_evento']}"</strong> en nuestra plataforma.</p>

                <div class="info-box">
                    <strong>📅 Fecha del evento:</strong> {contexto['fecha_inicio']}
                </div>

                <div class="codigo">
                    <p style="margin: 0; font-size: 14px; color: #666;">Tu código de seguimiento es:</p>
                    <p class="codigo-text">{contexto['codigo_seguimiento']}</p>
                    <p style="margin: 0; font-size: 12px; color: #666;">Guarda este código para consultar el estado de tu solicitud</p>
                </div>

                <h3>¿Qué sigue?</h3>
                <ul>
                    <li>Nuestro equipo revisará tu solicitud en las próximas 24-48 horas</li>
                    <li>Te notificaremos por email cuando haya una respuesta</li>
                    <li>Puedes consultar el estado en cualquier momento usando tu código</li>
                </ul>

                <div style="text-align: center; margin-top: 20px;">
                    <p><strong>¿Tienes dudas?</strong></p>
                    <p>Responde a este correo y te ayudaremos.</p>
                </div>

                <div class="footer">
                    <p>Este es un correo automático, por favor no respondas a esta dirección.</p>
                    <p>© 2025 Plataforma de Eventos de Salud. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    # Versión texto plano (fallback)
    mensaje_texto = f"""
Hola {contexto['nombre_contacto']},

Hemos recibido tu solicitud para publicar el evento "{contexto['nombre_evento']}" en nuestra plataforma.

📋 Tu código de seguimiento: {contexto['codigo_seguimiento']}

Fecha del evento: {contexto['fecha_inicio']}

¿Qué sigue?
- Nuestro equipo revisará tu solicitud en las próximas 24-48 horas
- Te notificaremos por email cuando haya una respuesta
- Puedes consultar el estado en cualquier momento usando tu código

¿Tienes dudas? Responde a este correo y te ayudaremos.

© 2025 Plataforma de Eventos de Salud
    """

    try:
        send_mail(
            asunto,
            mensaje_texto,
            settings.DEFAULT_FROM_EMAIL,
            [solicitud.email_contacto],
            html_message=mensaje_html,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar email de confirmación: {str(e)}")
        return False


def enviar_email_aprobacion(solicitud):
    """
    Envía email al solicitante cuando su evento es aprobado

    Args:
        solicitud: Instancia del modelo EventRequest
    """
    asunto = f'✅ Evento Aprobado - {solicitud.nombre_evento}'

    contexto = {
        'nombre_contacto': solicitud.nombre_contacto,
        'nombre_evento': solicitud.nombre_evento,
        'codigo_seguimiento': solicitud.codigo_seguimiento,
        'comentarios_admin': solicitud.comentarios_admin or '',
    }

    mensaje_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #4CAF50; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
            .success-box {{ background: #d4edda; border: 2px solid #4CAF50; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px; }}
            .info-box {{ background: #fff; padding: 15px; border-left: 4px solid #4CAF50; margin: 15px 0; }}
            .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 ¡Tu evento ha sido aprobado!</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{contexto['nombre_contacto']}</strong>,</p>

                <div class="success-box">
                    <h2 style="margin: 0; color: #4CAF50;">✅ Aprobado</h2>
                    <p style="font-size: 18px; margin: 10px 0 0 0;"><strong>{contexto['nombre_evento']}</strong></p>
                </div>

                <p>¡Excelentes noticias! Tu evento ha sido aprobado y ya está visible en nuestra plataforma.</p>

                {"<div class='info-box'><strong>💬 Comentarios del administrador:</strong><p>" + contexto['comentarios_admin'] + "</p></div>" if contexto['comentarios_admin'] else ""}

                <h3>¿Qué significa esto?</h3>
                <ul>
                    <li>Tu evento ahora aparece en el mapa interactivo de la plataforma</li>
                    <li>Los usuarios pueden ver toda la información que proporcionaste</li>
                    <li>Tu evento será visible para personas interesadas en actividades de salud y bienestar</li>
                </ul>

                <p><strong>Código de seguimiento:</strong> {contexto['codigo_seguimiento']}</p>

                <div style="text-align: center; margin-top: 30px;">
                    <p>¡Gracias por contribuir a nuestra comunidad de salud!</p>
                </div>

                <div class="footer">
                    <p>© 2025 Plataforma de Eventos de Salud. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    mensaje_texto = f"""
Hola {contexto['nombre_contacto']},

¡Excelentes noticias! Tu evento "{contexto['nombre_evento']}" ha sido APROBADO.

Tu evento ya está visible en nuestra plataforma y aparecerá en el mapa interactivo.

{f"Comentarios del administrador: {contexto['comentarios_admin']}" if contexto['comentarios_admin'] else ""}

Código de seguimiento: {contexto['codigo_seguimiento']}

¡Gracias por contribuir a nuestra comunidad!

© 2025 Plataforma de Eventos de Salud
    """

    try:
        send_mail(
            asunto,
            mensaje_texto,
            settings.DEFAULT_FROM_EMAIL,
            [solicitud.email_contacto],
            html_message=mensaje_html,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar email de aprobación: {str(e)}")
        return False


def enviar_email_rechazo(solicitud):
    """
    Envía email al solicitante cuando su evento es rechazado

    Args:
        solicitud: Instancia del modelo EventRequest
    """
    asunto = f'ℹ️ Información sobre tu solicitud - {solicitud.nombre_evento}'

    contexto = {
        'nombre_contacto': solicitud.nombre_contacto,
        'nombre_evento': solicitud.nombre_evento,
        'codigo_seguimiento': solicitud.codigo_seguimiento,
        'comentarios_admin': solicitud.comentarios_admin or 'No se proporcionó un motivo específico.',
    }

    mensaje_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
            .header {{ background: #f44336; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }}
            .content {{ background: #f9f9f9; padding: 30px; border-radius: 0 0 5px 5px; }}
            .warning-box {{ background: #fff3cd; border: 2px solid #ff9800; padding: 20px; margin: 20px 0; border-radius: 5px; }}
            .info-box {{ background: #fff; padding: 15px; border-left: 4px solid #f44336; margin: 15px 0; }}
            .footer {{ text-align: center; color: #666; font-size: 12px; margin-top: 30px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>📋 Estado de tu Solicitud</h1>
            </div>
            <div class="content">
                <p>Hola <strong>{contexto['nombre_contacto']}</strong>,</p>

                <p>Hemos revisado tu solicitud para el evento <strong>"{contexto['nombre_evento']}"</strong>.</p>

                <div class="warning-box">
                    <h3 style="margin-top: 0; color: #f44336;">❌ Solicitud no aprobada</h3>
                    <p>Lamentamos informarte que en esta ocasión no hemos podido aprobar tu evento para su publicación en la plataforma.</p>
                </div>

                <div class="info-box">
                    <strong>💬 Motivo:</strong>
                    <p>{contexto['comentarios_admin']}</p>
                </div>

                <h3>¿Qué puedes hacer?</h3>
                <ul>
                    <li>Revisar los comentarios del administrador</li>
                    <li>Si tienes dudas, puedes respondernos a este correo</li>
                    <li>Puedes enviar una nueva solicitud si resuelves los puntos mencionados</li>
                </ul>

                <p><strong>Código de seguimiento:</strong> {contexto['codigo_seguimiento']}</p>

                <div style="text-align: center; margin-top: 30px;">
                    <p>Agradecemos tu interés en participar en nuestra plataforma.</p>
                </div>

                <div class="footer">
                    <p>Si tienes preguntas, responde a este correo.</p>
                    <p>© 2025 Plataforma de Eventos de Salud. Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    mensaje_texto = f"""
Hola {contexto['nombre_contacto']},

Hemos revisado tu solicitud para el evento "{contexto['nombre_evento']}".

Lamentamos informarte que en esta ocasión no hemos podido aprobar tu evento.

Motivo:
{contexto['comentarios_admin']}

¿Qué puedes hacer?
- Revisar los comentarios del administrador
- Si tienes dudas, responde a este correo
- Puedes enviar una nueva solicitud si resuelves los puntos mencionados

Código de seguimiento: {contexto['codigo_seguimiento']}

Agradecemos tu interés en participar en nuestra plataforma.

© 2025 Plataforma de Eventos de Salud
    """

    try:
        send_mail(
            asunto,
            mensaje_texto,
            settings.DEFAULT_FROM_EMAIL,
            [solicitud.email_contacto],
            html_message=mensaje_html,
            fail_silently=False,
        )
        return True
    except Exception as e:
        print(f"Error al enviar email de rechazo: {str(e)}")
        return False
