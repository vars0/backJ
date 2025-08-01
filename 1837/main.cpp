#include <iostream>
#include <cstring>
using namespace std;

int mod_string_by_int(const char *num_str, int divisor)
{
  int result = 0;
  while (*num_str)
  {
    result = (result * 10 + (*num_str - '0')) % divisor;
    num_str++;
  }
  return result;
}

int main(int argc, char **argv)
{
  char *big_number = new char[110];
  int P, K;
  cin >> big_number >> K;
  for (int i = 2; i < K; i++)
  {
    if (mod_string_by_int(big_number, i) == 0)
    {
      printf("BAD %d\n", i);
      return 0;
    }
  }
  printf("GOOD\n");
  return 0;
}