package ex3_swich;

import java.util.Scanner;

public class SwitchExpressionExample {
	public static void main(String[] args) {
		//break를 빼먹으면 fall - through가 발생
		//값을 변수에 넣으면 중복 코드 많아짐
   	int num =2;
 	String result;
//		switch(num) {
//		case 1:
//			result = "A";
//			break;
//		case 2:
//			result = "B";
//			break;
//		case 3:
//			result = "C";
//			break;
//		default :
//			result = "F";
//			break;
//		}
		
//		String result = switch(num) {
//		case 1 -> "A";
//		case 2 -> "b";
//		case 3 -> "c";
//		default -> "F";
//		};
//		
//		//여러 case를 묶기가 불편
		int day =3;
//		String type;
//		switch(day) {
//		case 1:
//		case 2:
//		case 3:
//		case 4:
//		case 5:
//			type ="평일";
//			break;
//		case 6:
//		case 7:
//			type ="주말";
//			break;
//			
//		}
   	
		String type = switch(day) {
		case 1,2,3,4,5 -> "평일";
		case 6,7 -> "주말";
		default -> "잘못된 값";
		};
		
		System.out.println(type);
		
		//화살표 오른쪽에 여러 줄의 로직이 필요하다면 {}를 써야함
		//이때 최종적으로 반환할 값을 명시하려면 yield 키워드를 사용함
		result = switch(num) {
		case 1 -> "하나 ";
		case 2 -> {
			System.out.println("2가 입력됨");
			yield "둘";
		}
		default -> "기타";
		};
		
		int month = 3;
		
		String year = switch(month) {
		case 1,3,5,7,8,10,12 -> month + "월은 31일까지 있습니다.";
		case 4,6,9,11 -> month + "월은 30일까지 있습니다.";
		case 2 -> month + "월은 28일까지 있습니다.";
		default -> "잘못된 값";
		};
		
		System.out.println(year);
		
		Scanner sc = new Scanner(System.in);
		
		System.out.print("첫번째 숫자: ");
		int num1 = sc. nextInt();
		System.out.print("두번째 숫자: ");
		int num2 = sc.nextInt();
		System.out.print("사용할 연산자: ");
		String sign = sc.next();
		
		String result2 = switch(sign) {
		case "+" -> num1 + "+" + num2 + "=" + (num1 + num2);
		case "-" -> num1 + "-" + num2 + "=" + (num1 - num2);
		case "/" -> num1 + "/" + num2 + "=" + (num1 / num2);
		case "*" -> num1 + "*" + num2 + "=" + (num1 * num2);
		default -> "잘못 입력함";
		};
		System.out.println(result2);
		
   	
	}
}
