package ex1_generic.exam;
//Main에서 GenericBox<String>객체에게 "사과"저장후 출력
//GenericBox<Integer> 객체에 100저장 후 출력
public class Main {
	public static void main(String[] args) {
		GenericBox<String> g = new GenericBox<>();
		g.setItem("사과");
		System.out.println(g.getItem());
		
		GenericBox<Integer> g2 = new GenericBox<>();
		g2.setItem(100);
		System.out.println(g2.getItem());
		
		AnimalHospital<Dog> dogHospital = new AnimalHospital<Dog>(new Dog());
		AnimalHospital<Cat> catHospital = new AnimalHospital<Cat>(new Cat());
		dogHospital.treat();
		catHospital.treat();
		}
	
		
	
	}
