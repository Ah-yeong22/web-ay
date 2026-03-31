package ex1_overriding;

public class PrarTimeEmployee extends Employee {
	
	int wage;
	int time;
	
	public PrarTimeEmployee (String name,int wage, int time) {
		super(name);
		this.time = time;
		this.wage = wage;
	}

	public int getPay() {
		return wage*time;
	}
	
}
