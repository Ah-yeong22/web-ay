package ex1_lambda;

public class CalculatorService {

	//람다를 매개변수로 받는 메서드
	//식 자체를 매개변수로 넘길 수 있음
	public void execute(Calculator calculator) {
		int result = calculator.calc(10, 20);
		System.out.println("결과 : " + result);
	}


public Calculator getCalculator(String type) {
	if(type.equals("add")) {
		return(a,b) -> a+b;
	}else if(type.equals("Sub")){
		return(a,b)->a-b;
	} else {
		return null;
	}
 }

}