# Обзор
Это веб-приложение для рисования, которое позволяет пользователям рисовать различные фигуры на холсте с помощью жестов мыши или жестов рук, распознаваемых MediaPipe. Пользователи могут выбирать различные цвета, размеры кисти и варианты заливки. Рисунки могут быть очищены или сохранены в виде файла изображения.

![image](https://github.com/dilshod-egm/gesturedraw/assets/84387723/70f3f1c1-8039-473d-8e6b-096622a47490)


# Используемые технологии:
- HTML, CSS, JavaScript - для создания пользовательского интерфейса и функциональности рисования на холсте 
- MediaPipe - для отслеживания движения рук в реальном времени, что позволяет рисовать жестами рук
- Canvas API - для отображения рисунков на элементе HTML canvas

# Возможности:
- Рисование таких фигур, как прямоугольник, круг, треугольник, с возможностью добавления цвета заливки
- Рисование от руки с помощью кисти и ластика 
- Регулируемый размер кисти
- Цветовод для выбора цвета рисунка  
- Возможность очистки холста
- Сохранение рисунков в виде файлов изображений
- Переключение между рисованием с помощью мыши или жестов отслеживания руки
- Перемещение элементов пользовательского интерфейса по экрану с помощью жестов щипка

# Функциональность отслеживания рук:
Приложение использует MediaPipe для отслеживания рук в режиме реального времени, чтобы определить жесты и положение пальцев. Это позволяет рисовать на холсте, используя движения рук, а не мыши.

# Основными распознаваемыми жестами являются:
- Щипковый жест указательным и большим пальцами для запуска режима рисования
- Положение кончика пальца для управления кистью на холсте, аналогичное положению мыши.

Перетаскивание пользовательского интерфейса также реализовано с помощью жеста щипка.

# Параметры конфигурации:
Существует несколько настраиваемых параметров для функции отслеживания руки:

- Предпочитаемая рука: Левая или правая
- Режим отладки: Отображает отладочные визуализации для отслеживания руки
- Задержка нажатия: Устанавливает время задержки для обнаружения жеста щипка.
