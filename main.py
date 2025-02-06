from plantuml import PlantUML

def generate_use_case_diagram():
    diagram = """
    @startuml
    left to right direction
    actor Patient
    actor Doctor
    actor Administrator
    actor Pharmacist
    actor LabTechnician

    usecase "Запись на прием" as UC1
    usecase "Проведение диагностики" as UC2
    usecase "Выписка рецепта" as UC3
    usecase "Хранение медицинской карты" as UC4
    usecase "Управление запасами лекарств" as UC5

    Patient --> UC1
    Doctor --> UC2
    Doctor --> UC3
    Administrator --> UC1
    Pharmacist --> UC3
    LabTechnician --> UC2
    @enduml
    """
    return diagram

def save_and_render(diagram, filename):
    puml = PlantUML(url="http://www.plantuml.com/plantuml")
    with open(filename + ".puml", "w") as f:
        f.write(diagram)
    puml.processes_file(filename + ".puml")

if __name__ == "__main__":
    use_case_diagram = generate_use_case_diagram()
    save_and_render(use_case_diagram, "use_case_diagram")
