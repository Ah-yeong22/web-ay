package ex1_abstract;

public class TransportMain {
public static void main(String[] args) {
	Transport[] transport = {
			new Bus("버스", 1200),
			new Taxi("택시" ,4000,10,100),
			new Airplane("비행기",1000,1000,100)
	};
	
	for(Transport t : transport) {
		t.printFare();
		System.out.println("------------------");
		}
	}
	
}
