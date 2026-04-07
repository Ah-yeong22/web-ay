package ex3_generic;

import java.util.Arrays;

public class DataSampleExample {
	public static void main(String[] args) {
		//데이터리스트 객체 만들기
		//제네릭 타입에 전달할 수 있는것은 클래스밖에 안됨
		DataList<Integer> d = new DataList();
		
		d.add(10);
		d.add("문자열");
		d.add(3.1);
		
		//배열에 들어있는 내용을 출력 
		for(int i = 0; i<d.size(); i++) {
			Object data = d.get(i);
			
			if(data instanceof Integer) {
				System.out.println("정수 :" + (int)data);
			}else if (data instanceof Double) {
				System.out.println("실수 : " + (double)data);
			}else if (data instanceof String) {
				System.out.println("문자열 : " + (String)data);
			}
		}
		
		DataList<Double> d2 = new DataList<>();
		d2.add(10.0);
		d2.add(15.5);
		d2.add(753.88);
		
		for(int i = 0; i<d2.size(); i++) {
			System.out.println(d2.get(i));
		}
	}
}
