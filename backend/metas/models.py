from django.db import models
from django.contrib.auth.models import User


class MetaPeso(models.Model):
    """
    Modelo para gestionar las metas de peso de los usuarios.
    Incluye cálculos metabólicos automáticos.
    """

    NIVEL_ACTIVIDAD_CHOICES = [
        ('sedentario', 'Sedentario (poco o ningún ejercicio)'),
        ('ligero', 'Ligero (ejercicio 1-3 días/semana)'),
        ('moderado', 'Moderado (ejercicio 3-5 días/semana)'),
        ('activo', 'Activo (ejercicio intenso 6-7 días/semana)'),
        ('muy_activo', 'Muy Activo (ejercicio intenso diario o doble sesión)'),
    ]

    FACTORES_NAF = {
        'sedentario': 1.2,
        'ligero': 1.375,
        'moderado': 1.55,
        'activo': 1.725,
        'muy_activo': 1.9,
    }

    # Equivalencia: 1 kg de grasa corporal ≈ 7700 kcal
    CALORIAS_POR_KG = 7700

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='metas_peso')
    peso_actual = models.FloatField(help_text="Peso actual en kg")
    peso_objetivo = models.FloatField(help_text="Peso objetivo en kg")
    fecha_inicio = models.DateField(auto_now_add=True)
    fecha_objetivo = models.DateField(help_text="Fecha para alcanzar el objetivo")
    nivel_actividad = models.CharField(
        max_length=20,
        choices=NIVEL_ACTIVIDAD_CHOICES,
        default='sedentario'
    )
    activo = models.BooleanField(
        default=True,
        help_text="Si es False, la meta está archivada/completada"
    )

    # Campos calculados (se guardan para histórico)
    tmb = models.FloatField(null=True, blank=True, help_text="Tasa Metabólica Basal")
    get = models.FloatField(null=True, blank=True, help_text="Gasto Energético Total")
    deficit_diario = models.FloatField(
        null=True,
        blank=True,
        help_text="Déficit/Superávit calórico diario requerido"
    )
    meta_calorica_diaria = models.FloatField(
        null=True,
        blank=True,
        help_text="Meta calórica diaria"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-activo', '-created_at']
        verbose_name = 'Meta de Peso'
        verbose_name_plural = 'Metas de Peso'

    def __str__(self):
        return f"{self.user.username} - {self.peso_actual}kg → {self.peso_objetivo}kg"

    def calcular_tmb(self):
        """
        Calcula la Tasa Metabólica Basal usando la fórmula de Mifflin-St Jeor.
        TMB = (10 × peso) + (6.25 × altura) - (5 × edad) + s
        donde s = +5 para hombres, -161 para mujeres
        """
        try:
            profile = self.user.profile
            peso = self.peso_actual
            altura = profile.altura  # en cm
            edad = profile.edad
            sexo = profile.sexo  # 'M' o 'F'

            if not all([peso, altura, edad, sexo]):
                return None

            tmb = (10 * peso) + (6.25 * altura) - (5 * edad)

            if sexo == 'M':
                tmb += 5
            else:  # 'F' o 'O'
                tmb -= 161

            return round(tmb, 2)
        except Exception:
            return None

    def calcular_get(self):
        """
        Calcula el Gasto Energético Total.
        GET = TMB × Factor NAF
        """
        tmb = self.calcular_tmb()
        if tmb is None:
            return None

        factor_naf = self.FACTORES_NAF.get(self.nivel_actividad, 1.2)
        get = tmb * factor_naf

        return round(get, 2)

    def calcular_deficit_diario(self):
        """
        Calcula el déficit/superávit calórico diario requerido.

        1. Calcula días totales entre hoy y fecha_objetivo
        2. Calcula peso a cambiar (diferencia absoluta)
        3. Calcula calorías totales (peso_a_cambiar × 7700)
        4. Divide entre días totales

        Retorna:
            float: Déficit diario (positivo para pérdida, negativo para ganancia)
        """
        from datetime import date

        dias_totales = (self.fecha_objetivo - date.today()).days

        if dias_totales <= 0:
            return 0  # Meta ya vencida o es hoy

        peso_a_cambiar = self.peso_actual - self.peso_objetivo
        calorias_totales = peso_a_cambiar * self.CALORIAS_POR_KG
        deficit_diario = calorias_totales / dias_totales

        return round(deficit_diario, 2)

    def calcular_meta_calorica(self):
        """
        Calcula la meta calórica diaria.

        - Pérdida de peso: GET - déficit_diario
        - Ganancia de peso: GET + superávit_diario (déficit negativo)
        """
        get = self.calcular_get()
        deficit_diario = self.calcular_deficit_diario()

        if get is None or deficit_diario is None:
            return None

        meta_calorica = get - deficit_diario

        return round(max(meta_calorica, 1200), 2)  # Mínimo 1200 kcal por seguridad

    def save(self, *args, **kwargs):
        """
        Override save para calcular automáticamente los campos.
        """
        self.tmb = self.calcular_tmb()
        self.get = self.calcular_get()
        self.deficit_diario = self.calcular_deficit_diario()
        self.meta_calorica_diaria = self.calcular_meta_calorica()

        super().save(*args, **kwargs)

    @property
    def dias_restantes(self):
        """Días restantes para alcanzar la meta."""
        from datetime import date
        return (self.fecha_objetivo - date.today()).days

    @property
    def dias_totales(self):
        """Días totales desde el inicio hasta el objetivo."""
        return (self.fecha_objetivo - self.fecha_inicio).days

    @property
    def tipo_meta(self):
        """Retorna 'perdida', 'ganancia' o 'mantenimiento'."""
        if self.peso_actual > self.peso_objetivo:
            return 'perdida'
        elif self.peso_actual < self.peso_objetivo:
            return 'ganancia'
        return 'mantenimiento'

    @property
    def ritmo_validacion(self):
        """
        Valida el ritmo de la meta y retorna mensaje de advertencia.

        Retorna dict con:
            - tipo: 'extremo', 'correcto', 'lento'
            - mensaje: string con el mensaje
            - emoji: emoji visual
        """
        deficit = abs(self.deficit_diario) if self.deficit_diario else 0

        if deficit > 1000:
            return {
                'tipo': 'extremo',
                'emoji': '🚨',
                'mensaje': '¡Atención! El objetivo de peso requiere un ajuste calórico diario muy agresivo (más de 1000 kcal de déficit/superávit) para la fecha seleccionada. Esto podría ser insostenible o inseguro. Por favor, extienda su Meta Temporal para un progreso más saludable.'
            }
        elif deficit >= 500:
            return {
                'tipo': 'correcto',
                'emoji': '✅',
                'mensaje': '¡Ritmo excelente! Su meta es sostenible y segura. Continúe así.'
            }
        else:
            return {
                'tipo': 'lento',
                'emoji': '🐢',
                'mensaje': 'Ritmo Lento. Para alcanzar su meta en la Meta Temporal definida, su déficit/superávit diario debe ser mayor. Considere ajustar su nivel de actividad física.'
            }
